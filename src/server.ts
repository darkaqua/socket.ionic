import {getRandomString} from "./utis.ts";
import {Room, ServerClient} from "./types.ts";

export const getServerSocket = (
	port: number
) => {
	const clientList: Record<string, ServerClient> = {};
	const roomList: Record<string, Room> = {};
	const events: Record<string, any> = {};
	
	const server = Deno.serve({ port }, async (request) => {
		if (request.headers.get('upgrade') !== 'websocket')
			return new Response(null, { status: 501 });
		
		const protocols = (request.headers.get('Sec-WebSocket-Protocol') || '').split(',')
		const { socket, response } = Deno.upgradeWebSocket(request);
		
		const clientEvents: Record<string, any[]> = {};
		
		const clientId = getRandomString(16);
		
		if(events.guest && !events.guest(clientId, protocols)) return new Response(null, { status: 403 });
		
		const client: ServerClient = {
			id: clientId,
			emit: (event: string, message: any) => {
				if(socket.readyState !== WebSocket.OPEN) return;
				socket.send(JSON.stringify({ event, message }))
			},
			on: (event: string, callback: (data?: any) => void) => {
				if(!clientEvents[event])
					clientEvents[event] = [];
				return clientEvents[event].push(callback) -1;
			},
			remove: (event: string, id: number) =>
				clientEvents[event] = clientEvents[event].filter((client,index) => index === id ? undefined : client),
			rooms: [],
			getRooms: () => clientList[clientId].rooms.map(name => roomList[name]),
			addRoom: (name: string) => {
				if(clientList[clientId].rooms.includes(name))
					return console.warn(`Client ${clientId} is already in room ${name}!`);
				
				clientList[clientId].rooms.push(name);
				if (!roomList[name]) throw `Room ${name} not found`;
				
				roomList[name].clients.push(clientId);
			},
			removeRoom: (name: string) => {
				if(!clientList[clientId].rooms.includes(name))
					return console.warn(`Client ${clientId} is not in room ${name}!`);
				
				clientList[clientId].rooms.push(name);
				
				if (!roomList[name]) throw `Room ${name} not found`;
				
				roomList[name].clients = roomList[name].clients.filter(
					_clientId => _clientId !== clientId,
				);
			},
		};
		clientList[client.id] = client;
		
		socket.onopen = () => {
			events.connected && events.connected(client);
		};
		socket.onmessage = ({ data }) => {
			const { event, message } = JSON.parse(data);
			const clientEventList = (clientEvents[event] || []).filter(Boolean);
			if(clientEventList.length)
				for (const callback of clientEventList)
					callback(message)
		};
		socket.onclose = () => {
			events.disconnected && events.disconnected(client);
			for (const room of Object.values(roomList))
				room.clients = room.clients.filter(clientId => client.id !== clientId);
			
			delete clientList[client.id];
		};
		socket.onerror = error => {
			events.error && events.error(client, error);
		};
		
		return response;
	});
	
	const emit = (event: string, data?: any) => {
		for (const client of Object.values(clientList)) client.emit(event, data);
	};
	
	const on = (
		event: 'connected' | 'disconnected' | 'error' | 'guest',
		callback: (client: ServerClient, data?: any) => void,
	) => {
		events[event] = callback;
	};
	
	const getClient = (clientId: string): ServerClient => clientList[clientId];
	const getRoom = (name: string): Room => {
		if(roomList[name]) return roomList[name];
		
		const room: Room = {
			name,
			emit: (event: string, message: any) => {
				for (const client of roomList[name].getClients())
					client.emit(event, message);
			},
			
			clients: [],
			getClients: () =>
				roomList[name].clients.map(clientId => clientList[clientId]),
			addClient: (clientId: string) => {
				if (!clientList[clientId]) throw `Client ${clientId} not found`;
				
				roomList[name].clients.push(clientId);
			},
			removeClient: (clientId: string) => {
				if (!clientList[clientId]) throw `Client ${clientId} not found`;
				
				roomList[name].clients.push(clientId);
			},
		}
		roomList[name] = room;
		return room;
	};
	const removeRoom = (name: string) => {
		for (const client of roomList[name].getClients())
			client.rooms = client.rooms.filter(_name => name !== _name);
		
		delete roomList[name];
	};
	
	const close = () => server.shutdown()
	
	return {
		on,
		/**
		 * Broadcast
		 */
		emit,
		getClient,
		getRoom,
		removeRoom,
		close
	};
};