import React from "react";
import ChatMessage from "./ChatMessage";
import { formatDayLabel } from "../utils/dateUtils";

const ChatDayGroup = ({ group, onContextMenu }) => (
  <div className="whatsapp-chat__day">
    <div className="whatsapp-chat__day-label">{formatDayLabel(group.ts)}</div>

    {group.items.map((message) => (
      <ChatMessage
        key={message.id + message.timestamp}
        message={message}
        onContextMenu={onContextMenu}
      />
    ))}
  </div>
);

export default ChatDayGroup;
