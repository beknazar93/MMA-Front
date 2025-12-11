// import { io } from "socket.io-client";
// import { WHATSAPP_SOCKET_URL } from "../../config/whatsappConfig";

// export const socket = io(WHATSAPP_SOCKET_URL);


import { io } from "socket.io-client";
import { WHATSAPP_SOCKET_URL } from "../../config/whatsappConfig";

export const socket = io(WHATSAPP_SOCKET_URL);
