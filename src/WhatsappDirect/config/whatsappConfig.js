// // общий конфиг для WhatsApp-модуля (CRA)

// const API_URL =
//   process.env.REACT_APP_WHATSAPP_API_URL || "http://217.198.12.206";

// const SOCKET_URL =
//   process.env.REACT_APP_WHATSAPP_SOCKET_URL || API_URL;

// export const WHATSAPP_API_URL = API_URL;
// export const WHATSAPP_SOCKET_URL = SOCKET_URL;




// src/config/whatsappConfig.js

// Всё храним только здесь, без .env
const API_URL = "http://localhost:3001";
const SOCKET_URL = API_URL; // если захочешь другой порт — поменяешь тут

export const WHATSAPP_API_URL = API_URL;
export const WHATSAPP_SOCKET_URL = SOCKET_URL;
