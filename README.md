# @da/socket

## Server

```ts
import { getServerSocket } from "@da/socket";

const server = getServerSocket(1994);

server.on("guest", (clientId: string, protocols: string[]) => {
  // check if guest can join
  return true;
});
server.on("connected", (client) => {
  // emit to client
  client.on("ping", (message) => {
    client.emit("ping");
  });
  // Add client to room
  client.addRoom("room");
  // return all rooms
  client.getRooms();
  // Remove a room
  client.removeRoom("room");

  // get room
  const room = server.getRoom("room");
  // emit to room
  room.emit("channel", "Hello from room!");
  // add client to room
  room.addClient(client.id);
  // remove client from room
  room.removeClient(client.id);
});
server.on("error", (client, error) => {
  // client has an error
});
server.on("disconnected", (client) => {
  // client is disconnected
});

// emit broadcast
server.emit("channel", "Hello from boradcast!");
```

## Client

```ts
const client = getClientSocket("localhost:1994", ["session", "token"]);
client.on("connected", () => {
  // client is connected

  // listen to a channel
  client.on("ping", (message) => {
    // client emit message
    client.emit("pong", { date: Date.now() });
  });
});
client.on("error", () => {
  // client error
});
client.on("disconnected", () => {
  // client is disconnected
});
```
