import { useEffect, useState } from "react";
import { api } from "../../api/whatsappApi";
import { socket } from "../utils/socket";

const useMessages = (chatId) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    api
      .get(`/messages/${chatId}`)
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setMessages(data);
      })
      .catch(() => {
        setMessages([]);
      });
  }, [chatId]);

  useEffect(() => {
    const handleNewMessage = (data) => {
      if (!data || data.chatId !== chatId) return;
      setMessages((prev) => [...prev, data.message]);
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [chatId]);

  return messages;
};

export default useMessages;
