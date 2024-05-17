
type EmitFunctionType = (event: string, data?: any, response?: (message?: any) => void) => void

export type ServerClient = {
  id: string;
  _emit: EmitFunctionType;
  emit: EmitFunctionType;
  on: (event: string, callback: (data?: any) => Promise<void> | any) => void;
  remove: (event: string, id: number) => void;
  rooms: string[];

  getRooms: () => Room[];
  addRoom: (name: string) => void;
  removeRoom: (name: string) => void;
  
  getSocket: () => WebSocket
};

export type Room = {
  name: string;
  emit: (event: string, data?: any) => void;
  clients: string[];

  getClients: () => ServerClient[];
  addClient: (clientId: string) => void;
  removeClient: (clientId: string) => void;
};
