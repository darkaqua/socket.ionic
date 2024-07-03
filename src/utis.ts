export const getRandomString = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};
export const getWebSocketUrl = (url: string) => {
  const { protocol, hostname, pathname, port } = new URL(url);
  
  const socketProtocol = protocol === "http:" ? "ws:" : "wss:";
  return `${socketProtocol}//${hostname}${port ? `:${port}` : ""}${pathname}`;
};