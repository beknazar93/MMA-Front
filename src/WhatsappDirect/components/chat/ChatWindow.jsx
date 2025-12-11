import React, { useEffect, useRef, useState } from "react";
import useMessages from "../hooks/useMessages";
import { groupByDay } from "../utils/dateUtils";
import ChatDayGroup from "./ChatDayGroup";
import ChatContextMenu from "./ChatContextMenu";

const ChatWindow = ({ chatId, onReply }) => {
  const messages = useMessages(chatId);
  const [contextMenu, setContextMenu] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [chatId, messages.length]);

  if (!chatId) {
    return (
      <div className="whatsapp-chat whatsapp-chat--empty">
        Выберите чат слева
      </div>
    );
  }

  const groups = groupByDay(messages);

  const handleContextMenu = (event, message) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      message,
    });
  };

  const handleCloseMenu = () => {
    setContextMenu(null);
  };

  const handleReplyFromMenu = (message) => {
    if (onReply) {
      onReply(message);
    }
  };

  return (
    <div
      className="whatsapp-chat"
      onClick={handleCloseMenu}
      ref={containerRef}
    >
      {groups.map((group) => (
        <ChatDayGroup
          key={group.key}
          group={group}
          onContextMenu={handleContextMenu}
        />
      ))}

      <ChatContextMenu
        context={contextMenu}
        onReply={handleReplyFromMenu}
        onClose={handleCloseMenu}
      />
    </div>
  );
};

export default ChatWindow;
