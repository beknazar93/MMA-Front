import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './WhatsAppBot.scss';

const WhatsAppBot = () => {
  const [qrCode, setQrCode] = useState('');
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const placeholder50 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNjY2MiLz48dGV4dCB4PSIyNSIgeT0iMzAiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiPk5vIEF2YXRhcjwvdGV4dD48L3N2Zz4=';
  const placeholder40 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNjY2MiLz48dGV4dCB4PSIyMCIgeT0iMjQiIGZvbnQtc2l6ZT0iOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiI+Tm8gQXZhdGFyPC90ZXh0Pjwvc3ZnPg==';

  // Получение QR-кода
  useEffect(() => {
    const fetchQR = async () => {
      try {
        const response = await axios.get('http://localhost:5000/qr');
        setQrCode(response.data.qr);
      } catch (err) {
        console.error('Ошибка получения QR:', err);
      }
    };
    fetchQR();
    const interval = setInterval(fetchQR, 5000);
    return () => clearInterval(interval);
  }, []);

  // Получение списка чатов
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/chats');
        setChats(response.data);
      } catch (err) {
        console.error('Ошибка получения чатов:', err);
      }
    };
    if (!qrCode) {
      fetchChats();
      const interval = setInterval(fetchChats, 10000);
      return () => clearInterval(interval);
    }
  }, [qrCode]);

  // Получение сообщений выбранного чата
  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
          const response = await axios.get(`http://localhost:5000/messages/${selectedChat.id}`);
          setMessages(response.data);
          // Прокрутка к последнему сообщению только при первой загрузке чата
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
          }, 0);
        } catch (err) {
          console.error('Ошибка получения сообщений:', err);
        } finally {
          setLoadingMessages(false);
        }
      };
      fetchMessages();
    }
  }, [selectedChat]);

  // Отправка сообщения или медиа
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedChat || (!message.trim() && !file)) return;
    const scrollHeight = messagesContainerRef.current?.scrollHeight || 0;
    const scrollTop = messagesContainerRef.current?.scrollTop || 0;
    const clientHeight = messagesContainerRef.current?.clientHeight || 0;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;

    try {
      if (file) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result;
          const mimetype = file.type;
          await axios.post('http://localhost:5000/send-media', {
            chatId: selectedChat.id,
            base64,
            mimetype,
            caption: message
          });
          setMessage('');
          setFile(null);
          fileInputRef.current.value = '';
          const response = await axios.get(`http://localhost:5000/messages/${selectedChat.id}`);
          setMessages(response.data);
          if (isAtBottom) {
            setTimeout(() => {
              if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
              }
            }, 0);
          }
        };
        reader.readAsDataURL(file);
      } else if (message.trim()) {
        await axios.post('http://localhost:5000/send', {
          chatId: selectedChat.id,
          message
        });
        setMessage('');
        const response = await axios.get(`http://localhost:5000/messages/${selectedChat.id}`);
        setMessages(response.data);
        if (isAtBottom) {
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
          }, 0);
        }
      }
    } catch (err) {
      alert('Ошибка при отправке!');
    }
  };

  // Выход
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/logout');
      setQrCode('');
      setChats([]);
      setMessages([]);
      setSelectedChat(null);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      const response = await axios.get('http://localhost:5000/qr');
      setQrCode(response.data.qr);
      alert('Выход выполнен!');
    } catch (err) {
      alert('Ошибка при выходе!');
    }
  };

  // Обработка выбора файла
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Рендеринг сообщения в зависимости от типа
  const renderMessage = (msg) => {
    const time = new Date(msg.timestamp * 1000).toLocaleTimeString();
    let content = null;
    let caption = msg.body ? <p className="whatsapp-bot__message-caption">{msg.body}</p> : null;

    switch (msg.type) {
      case 'image':
        content = msg.mediaUrl ? <img className="whatsapp-bot__message-media" src={msg.mediaUrl} alt="Image" /> : null;
        break;
      case 'video':
        if (msg.isGif) {
          content = msg.mediaUrl ? (
            <video className="whatsapp-bot__message-media whatsapp-bot__message-gif" autoPlay loop muted playsInline>
              <source src={msg.mediaUrl} type={msg.mediaUrl.split(';')[0].split(':')[1]} />
            </video>
          ) : null;
        } else {
          content = msg.mediaUrl ? (
            <video className="whatsapp-bot__message-media" controls>
              <source src={msg.mediaUrl} type={msg.mediaUrl.split(';')[0].split(':')[1]} />
            </video>
          ) : null;
        }
        break;
      case 'ptt':
      case 'audio':
        content = msg.mediaUrl ? (
          <audio className="whatsapp-bot__message-media" controls>
            <source src={msg.mediaUrl} type={msg.mediaUrl.split(';')[0].split(':')[1]} />
          </audio>
        ) : null;
        break;
      case 'sticker':
        content = msg.mediaUrl ? <img className="whatsapp-bot__message-media whatsapp-bot__message-sticker" src={msg.mediaUrl} alt="Sticker" /> : null;
        break;
      case 'document':
        content = msg.mediaUrl ? <a className="whatsapp-bot__message-file" href={msg.mediaUrl} download={msg.filename || 'document'}>Скачать файл: {msg.filename || 'document'}</a> : null;
        break;
      case 'location':
        content = <p>📍 Местоположение: {msg.body}</p>;
        caption = null;
        break;
      case 'contact':
        content = <p>👤 Контакт: {msg.body}</p>;
        caption = null;
        break;
      default:
        content = msg.body ? <p>{msg.body}</p> : null;
        caption = null;
    }

    return (
      <>
        {content}
        {caption}
        <span className="whatsapp-bot__message-timestamp">{time}</span>
      </>
    );
  };

  return (
    <div className="whatsapp-bot">
      {qrCode ? (
        <div className="whatsapp-bot__qr">
          <img className="whatsapp-bot__qr-img" src={qrCode} alt="QR-код" />
          <p>Отсканируйте QR-код в WhatsApp</p>
        </div>
      ) : (
        <div className="whatsapp-bot__container">
          <div className="whatsapp-bot__sidebar">
            <div className="whatsapp-bot__header">
              <h2>WhatsApp</h2>
              <button className="whatsapp-bot__logout" onClick={handleLogout}>Выйти</button>
            </div>
            <div className="whatsapp-bot__chat-list">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  className={`whatsapp-bot__chat ${selectedChat?.id === chat.id ? 'whatsapp-bot__chat--active' : ''}`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <img
                    className="whatsapp-bot__chat-avatar"
                    src={chat.avatar || placeholder50}
                    alt="Avatar"
                    onError={(e) => (e.target.src = placeholder50)}
                  />
                  <div className="whatsapp-bot__chat-info">
                    <h4 className="whatsapp-bot__chat-name">{chat.name}</h4>
                    <p className="whatsapp-bot__chat-message">{chat.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="whatsapp-bot__main">
            {selectedChat ? (
              <>
                <div className="whatsapp-bot__chat-header">
                  <img
                    className="whatsapp-bot__chat-header-avatar"
                    src={selectedChat.avatar || placeholder40}
                    alt="Avatar"
                    onError={(e) => (e.target.src = placeholder40)}
                  />
                  <h3>{selectedChat.name}</h3>
                </div>
                <div className="whatsapp-bot__messages" ref={messagesContainerRef}>
                  {loadingMessages ? (
                    <div className="whatsapp-bot__loading">Загрузка сообщений...</div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`whatsapp-bot__message ${msg.fromMe ? 'whatsapp-bot__message--sent' : 'whatsapp-bot__message--received'}`}
                      >
                        {renderMessage(msg)}
                      </div>
                    ))
                  )}
                </div>
                <form className="whatsapp-bot__form" onSubmit={handleSendMessage}>
                  <button
                    type="button"
                    className="whatsapp-bot__file-button"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="#54656f" d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm5 11h-4v4a1 1 0 0 1-2 0v-4H7a1 1 0 0 1 0-2h4V7a1 1 0 0 1 2 0v4h4a1 1 0 0 1 0 2z"/>
                    </svg>
                  </button>
                  <input
                    type="file"
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileChange}
                    className="whatsapp-bot__file-input"
                    ref={fileInputRef}
                  />
                  <input
                    className="whatsapp-bot__input"
                    type="text"
                    placeholder="Введите сообщение..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button className="whatsapp-bot__send-button" type="submit">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="#25D366" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="whatsapp-bot__empty">Выберите чат для общения</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppBot;