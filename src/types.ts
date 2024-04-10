
export type ServerClient = {
	id: string;
	emit: (event: string, data?: any) => void;
	on: (event: string, callback: (data?: any) => void) => void;
	remove: (event: string, id: number) => void;
	rooms: string[];
	
	getRooms: () => Room[];
	addRoom: (name: string) => void;
	removeRoom: (name: string) => void;
};

export type Room = {
	name: string;
	emit: (event: string, data?: any) => void;
	clients: string[];
	
	getClients: () => ServerClient[];
	addClient: (clientId: string) => void;
	removeClient: (clientId: string) => void;
};