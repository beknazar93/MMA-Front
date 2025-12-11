// import axios from "axios";

// export const api = axios.create({
//   baseURL: "http://localhost:3001",
//   // baseURL: "http://eva.adam247.webtm.ru",
// });



import axios from "axios";
import { WHATSAPP_API_URL } from "../config/whatsappConfig";

export const api = axios.create({
  baseURL: WHATSAPP_API_URL,
});
