
export const getClientSocket = (url: string, protocols: string[] =[]) => {
	const events: Record<string, any> = {};
	
	const socket = new WebSocket(`ws://${url}`, protocols);
	
	// Connection opened
	socket.addEventListener('open', () => events.connected && events.connected());
	
	// Listen for messages
	socket.addEventListener('message', ({ data }) => {
		console.log(data)
		const { event, message } = JSON.parse(data);
		events[event] && events[event](message);
	});
	
	socket.addEventListener('error', () => events.error && events.error());
	
	socket.addEventListener(
		'close',
		() => events.disconnected && events.disconnected(),
	);
	
	const emit = (event: string, message?: any) =>
		socket.send(JSON.stringify({ event, message }));
	
	const on = (
		event: 'connected' | 'disconnected' | 'error' | string,
		callback: (data?: any) => void,
	) => events[event] = callback;
	
	return {
		emit,
		on,
	};
};
