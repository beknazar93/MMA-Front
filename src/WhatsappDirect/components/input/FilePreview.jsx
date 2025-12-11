import React from "react";

const FilePreview = ({ file, onRemove }) => {
  if (!file) return null;

  return (
    <div className="whatsapp-file">
      <span className="whatsapp-file__name">{file.name}</span>
      <button
        type="button"
        className="whatsapp-file__remove"
        onClick={onRemove}
      >
        ✕
      </button>
    </div>
  );
};

export default FilePreview;
