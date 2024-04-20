type Props = {
  url: string;
  reconnect?: boolean;
  reconnectIntents?: number;
  reconnectInterval?: number;
  silent?: boolean;
};

export const getClientSocket = (
  {
    url,
    reconnect = true,
    reconnectIntents = 10,
    reconnectInterval = 1_000,
    silent = false,
  }: Props,
) => {
  const events: Record<string, any> = {};

  let socket;
  let reconnects = 0;
  let isConnected = false;

  const connect = async () =>
    new Promise((resolve, reject) => {
      !silent && reconnects === 0 && console.log(`Connecting to ${url}!`);
      socket = new WebSocket(`ws://${url}`);

      // Connection opened
      socket.addEventListener("open", () => {
        isConnected = true;
        !silent && console.log(`Connected to ${url}!`);
        events.connected && events.connected();
        resolve();
        reconnects = 0;
      });

      // Listen for messages
      socket.addEventListener("message", ({ data }) => {
        const { event, message } = JSON.parse(data);
        events[event] && events[event](message);
      });

      socket.addEventListener("error", () => events.error && events.error());

      socket.addEventListener(
        "close",
        () => {
          !silent && isConnected && console.log(`Disconnected from ${url}!`);
          isConnected = false;

          if (reconnect && reconnectIntents > reconnects) {
            reconnects++;
            !silent &&
              console.log(
                `(${reconnects}/${reconnectIntents}) Reconnecting to ${url} in ${reconnectInterval}ms...`,
              );
            setTimeout(async () => {
              await connect();
              resolve();
            }, reconnectInterval);
            return;
          }
          events.disconnected && events.disconnected();
          resolve();
        },
      );
    });

  const emit = (event: string, message?: any) =>
    socket.send(JSON.stringify({ event, message }));

  const on = (
    event: "connected" | "disconnected" | "error" | string,
    callback: (data?: any) => void,
  ) => events[event] = callback;

  const close = () => socket.close();

  return {
    connect,
    emit,
    on,
    close,
  };
};
