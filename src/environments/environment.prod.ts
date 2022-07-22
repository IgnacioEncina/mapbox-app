import { SocketIoConfig } from "ngx-socket-io";

const config: SocketIoConfig = { url: 'http://localhost:8988', options: {} };  // Añadido Video 86 min 2:40

export const environment = {
  production: true,
  socketConfig: config             /// Añadido en Video 87 min 2:40
};
