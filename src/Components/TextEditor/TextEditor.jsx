import React, { useState, useEffect } from 'react';
import styles from './TextEditor.module.scss';

const TextEditor = () => {
  const [texts, setTexts] = useState([]);
  const [newTextRu, setNewTextRu] = useState('');
  const [newTextKy, setNewTextKy] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTextRu, setEditTextRu] = useState('');
  const [editTextKy, setEditTextKy] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('Нет refresh токена');
    const response = await fetch('https://dar.kg/api/v1/users/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw new Error('Ошибка обновления токена');
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('access_token');
    if (!token) token = await refreshToken();
    const headers = { ...options.headers, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      token = await refreshToken();
      headers.Authorization = `Bearer ${token}`;
      return await fetch(url, { ...options, headers });
    }
    return response;
  };

  const fetchTexts = async () => {
    try {
      const response = await fetchWithAuth('https://dar.kg/api/v1/listings/text-message/');
      if (response.ok) {
        const data = await response.json();
        setTexts(data);
      } else {
        setNotification({ message: 'Ошибка загрузки текстов', type: 'error', visible: true });
      }
    } catch {
      setNotification({ message: 'Ошибка загрузки текстов', type: 'error', visible: true });
    }
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
  };

  useEffect(() => {
    fetchTexts();
  }, []);

  const handleAddText = async () => {
    if (!newTextRu.trim() || !newTextKy.trim()) {
      setNotification({ message: 'Оба текста (русский и кыргызский) должны быть заполнены', type: 'error', visible: true });
      setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
      return;
    }
    try {
      const response = await fetchWithAuth('https://dar.kg/api/v1/listings/text-message/', {
        method: 'POST',
        body: JSON.stringify({ text_ru: newTextRu, text_ky: newTextKy }),
      });
      if (response.ok) {
        const data = await response.json();
        setTexts([...texts, data]);
        setNewTextRu('');
        setNewTextKy('');
        setNotification({ message: 'Текст добавлен', type: 'success', visible: true });
      } else {
        setNotification({ message: 'Ошибка добавления текста', type: 'error', visible: true });
      }
    } catch {
      setNotification({ message: 'Ошибка добавления текста', type: 'error', visible: true });
    }
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
  };

  const handleEditClick = (id, textRu, textKy) => {
    setEditingId(id);
    setEditTextRu(textRu);
    setEditTextKy(textKy);
  };

  const handleUpdateText = async (id) => {
    if (!editTextRu.trim() || !editTextKy.trim()) {
      setNotification({ message: 'Оба текста (русский и кыргызский) должны быть заполнены', type: 'error', visible: true });
      setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
      return;
    }
    try {
      const response = await fetchWithAuth(`https://dar.kg/api/v1/listings/text-message/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({ text_ru: editTextRu, text_ky: editTextKy }),
      });
      if (response.ok) {
        const data = await response.json();
        setTexts(texts.map(item => (item.id === id ? data : item)));
        setEditingId(null);
        setEditTextRu('');
        setEditTextKy('');
        setNotification({ message: 'Текст обновлен', type: 'success', visible: true });
      } else {
        setNotification({ message: 'Ошибка обновления текста', type: 'error', visible: true });
      }
    } catch {
      setNotification({ message: 'Ошибка обновления текста', type: 'error', visible: true });
    }
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
  };

  const handleDeleteText = async (id) => {
    try {
      const response = await fetchWithAuth(`https://dar.kg/api/v1/listings/text-message/${id}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTexts(texts.filter(item => item.id !== id));
        setNotification({ message: 'Текст удален', type: 'success', visible: true });
      } else {
        setNotification({ message: 'Ошибка удаления текста', type: 'error', visible: true });
      }
    } catch {
      setNotification({ message: 'Ошибка удаления текста', type: 'error', visible: true });
    }
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
  };

  return (
    <section className={styles.textEditor}>
      <div className={styles.textEditor__container}>
        <h2 className={styles.textEditor__title}>О нас</h2>
        <div className={styles.textEditor__form}>
          <input
            type="text"
            value={newTextRu}
            onChange={(e) => setNewTextRu(e.target.value)}
            placeholder="Введите текст на русском"
            className={styles.textEditor__input}
          />
          <input
            type="text"
            value={newTextKy}
            onChange={(e) => setNewTextKy(e.target.value)}
            placeholder="Жаңы текстти кыргыз тилинде киргизиңиз"
            className={styles.textEditor__input}
          />
          <button onClick={handleAddText} className={styles.textEditor__button}>
            <svg viewBox="0 0 24 24">
              <path d="M12 5v14m-7-7h14" />
            </svg>
          </button>
        </div>
        <div className={styles.textEditor__list}>
          {texts.length > 0 ? (
            texts.map(item => (
              <div key={item.id} className={styles.textEditor__item}>
                {editingId === item.id ? (
                  <>
                    <input
                      type="text"
                      value={editTextRu}
                      onChange={(e) => setEditTextRu(e.target.value)}
                      placeholder="Текст на русском"
                      className={styles.textEditor__item_input}
                    />
                    <input
                      type="text"
                      value={editTextKy}
                      onChange={(e) => setEditTextKy(e.target.value)}
                      placeholder="Текст на кыргызском"
                      className={styles.textEditor__item_input}
                    />
                    <button
                      onClick={() => handleUpdateText(item.id)}
                      className={`${styles.textEditor__button} ${styles['textEditor__button--save']}`}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-9 14l-5-5 5-5 5 5-5 5z" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <span className={styles.textEditor__item_text}>
                      RU: {item.text_ru} | KY: {item.text_ky}
                    </span>
                    <button
                      onClick={() => handleEditClick(item.id, item.text_ru, item.text_ky)}
                      className={`${styles.textEditor__button} ${styles['textEditor__button--edit']}`}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteText(item.id)}
                  className={`${styles.textEditor__button} ${styles['textEditor__button--delete']}`}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className={styles.textEditor__empty}>Нет текстов</div>
          )}
        </div>
        {notification.visible && (
          <div className={`${styles.textEditor__notification} ${styles[`notification--${notification.type}`]}`}>
            {notification.message}
          </div>
        )}
      </div>
    </section>
  );
};

export default TextEditor;