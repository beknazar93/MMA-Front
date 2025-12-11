import React, { useState } from "react";
import Sidebar from "./sidebar/Sidebar";
import ChatHeader from "./chat/ChatHeader";
import ChatWindow from "./chat/ChatWindow";
import MessageInput from "./input/MessageInput";
import "./styles/whatsapp.scss";

const WhatsappModule = () => {
  const [activeDialog, setActiveDialog] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const handleSelectDialog = (dialog) => {
    setActiveDialog(dialog);
    setReplyTo(null);
  };

  const handleReply = (message) => {
    setReplyTo(message);
  };

  const clearReply = () => {
    setReplyTo(null);
  };

  const activeChatId = activeDialog ? activeDialog.chatId : null;

  return (
    <div className="whatsapp">
      <Sidebar activeChatId={activeChatId} onSelect={handleSelectDialog} />

      <div className="whatsapp__main">
        <ChatHeader dialog={activeDialog} />
        <ChatWindow chatId={activeChatId} onReply={handleReply} />
        <MessageInput chatId={activeChatId} replyTo={replyTo} clearReply={clearReply} />
      </div>
    </div>
  );
};

export default WhatsappModule;
