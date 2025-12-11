// src/WhatsappDirect/chat/ChatMessage.jsx
import React from "react";
import { formatTime } from "../utils/dateUtils";

const ChatMessage = ({ message, onContextMenu }) => {
  const className =
    "whatsapp-chat__message whatsapp-chat__message--" +
    (message.from === "me" ? "me" : "client");

  const handleContextMenu = (event) => {
    event.preventDefault();
    if (typeof onContextMenu === "function") {
      onContextMenu(event, message);
    }
  };

  const isImage =
    message.mediaUrl &&
    (message.mediaType === "imageMessage" || message.mediaType === "image");

  const isVideo =
    message.mediaUrl &&
    (message.mediaType === "videoMessage" || message.mediaType === "video");

  const isAudio =
    message.mediaUrl &&
    (message.mediaType === "audioMessage" ||
      message.mediaType === "ptt" ||
      message.mediaType === "audio");

  return (
    <div className={className} onContextMenu={handleContextMenu}>
      {message.replyTo && (
        <div className="whatsapp-chat__reply">
          <div className="whatsapp-chat__reply-author">
            {message.replyTo.from === "me" ? "Вы" : "Собеседник"}
          </div>
          <div className="whatsapp-chat__reply-text">
            {message.replyTo.text}
          </div>
        </div>
      )}

      {isImage && (
        <img
          src={message.mediaUrl}
          alt=""
          className="whatsapp-chat__media whatsapp-chat__media--image"
        />
      )}

      {isVideo && (
        <video
          controls
          className="whatsapp-chat__media whatsapp-chat__media--video"
        >
          <source src={message.mediaUrl} />
        </video>
      )}

      {isAudio && (
        <audio
          controls
          className="whatsapp-chat__media whatsapp-chat__media--audio"
        >
          <source src={message.mediaUrl} />
        </audio>
      )}

      {message.text && (
        <div className="whatsapp-chat__message-text">{message.text}</div>
      )}

      <span className="whatsapp-chat__message-time">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
};

export default ChatMessage;
