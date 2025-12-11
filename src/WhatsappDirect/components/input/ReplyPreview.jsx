import React from "react";

const ReplyPreview = ({ replyTo, onClear }) => {
  if (!replyTo) return null;

  return (
    <div className="whatsapp-reply">
      <div className="whatsapp-reply__bar" />
      <div className="whatsapp-reply__content">
        <div className="whatsapp-reply__title">
          {replyTo.from === "me" ? "Вы" : "Собеседник"}
        </div>
        <div className="whatsapp-reply__text">{replyTo.text}</div>
      </div>
      <button
        type="button"
        className="whatsapp-reply__close"
        onClick={onClear}
      >
        ✕
      </button>
    </div>
  );
};

export default ReplyPreview;
