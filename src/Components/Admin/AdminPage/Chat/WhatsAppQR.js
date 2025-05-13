import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const INSTANCE_ID = 'instance110272';
const TOKEN = 'l6y9t716zv0l25vp';
const API_URL = `https://api.ultramsg.com/${INSTANCE_ID}`;

const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('7')) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  }
  return `+${cleaned}`;
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const WhatsAppChat = () => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const messagesEndRef = useRef(null);

  const fetchChats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/chats`, {
        params: { token: TOKEN },
      });
      setChats(data.sort((a, b) => b.unread - a.unread));
    } catch (error) {
      console.error('Ошибка получения чатов:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data } = await axios.get(`${API_URL}/chats/messages`, {
        params: { token: TOKEN, chatId, limit: 70 },
      });
      setMessages(data);
      setChats((prevChats) => prevChats.map(chat => chat.id === chatId ? { ...chat, unread: 0 } : chat));
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Ошибка получения сообщений:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentChat || !newMessage) return;
    try {
      await axios.post(`${API_URL}/messages/chat`, {
        token: TOKEN,
        to: currentChat,
        body: newMessage,
      });
      setNewMessage('');
      fetchMessages(currentChat);
    } catch (error) {
      console.error('Ошибка отправки:', error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchChats();
      if (currentChat) fetchMessages(currentChat);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentChat]);

  const renderMessageContent = (msg) => {
    switch (msg.type) {
      case 'image':
        return msg.media ? <img src={msg.media} alt="Фото" className="message-media" /> : 'Фото';
      case 'video':
        return msg.media ? <video controls className="message-media"><source src={msg.media} type="video/mp4" /></video> : 'Видео';
      case 'audio':
      case 'ptt':
        return msg.media ? <audio controls className="message-audio"><source src={msg.media} type="audio/ogg" /></audio> : 'Голосовое сообщение';
      case 'document':
        return msg.media ? <a href={msg.media} download className="message-document">Скачать документ</a> : 'Документ';
      case 'call_log':
        return msg.body.includes('missed') ? 'Пропущенный звонок' : 'Исходящий/входящий звонок';
      case 'chat':
        return msg.body || 'Сообщение';
      case 'location':
        return '📍 Отправлена локация';
      case 'contact':
        return '📞 Отправлен контакт';
      default:
        return 'Неизвестное сообщение';
    }
  };

  return (
    <div className="whatsapp-chat">
      <button className="burger-menu" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        ☰
      </button>
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h3>Чаты</h3>
        <ul>
          {chats.map((chat) => (
            <li key={chat.id} className={currentChat === chat.id ? 'active' : ''} onClick={() => { setCurrentChat(chat.id); fetchMessages(chat.id); setIsSidebarOpen(false); }}>
              <img 
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvFDDvFnERUV4rSN7nAF_UjvwnQVYs5sd2fA&s'
              alt="Аватар" className="avatar" />
              <span className="chat-name">{chat.name || formatPhoneNumber(chat.id)}</span>
              {chat.unread > 0 && <span className="unread-count">{chat.unread}</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-window">
        {currentChat ? (
          <>
            <div className="chat-header">Чат с {chats.find(chat => chat.id === currentChat)?.name || formatPhoneNumber(currentChat)}</div>
            <div className="chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.fromMe ? 'outgoing' : 'incoming'}`}> 
                  <div className="message-info">
                    <span className="author">{msg.fromMe ? 'Вы' : msg.senderName || formatPhoneNumber(msg.from)}</span>
                  </div>
                  <div className="message-content">{renderMessageContent(msg)}</div>
                  <div className="message-meta">
                    <span className="time">{formatTime(msg.timestamp)}</span>
                    <span className="status">{msg.ack === 'read' ? '✔✔' : '✔'}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
              <input type="text" placeholder="Введите сообщение..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
              <button onClick={sendMessage}>Отправить</button>
            </div>
          </>
        ) : (<div className="select-chat">Выберите чат из списка</div>)}
      </div>
    </div>
  );
};

export default WhatsAppChat;