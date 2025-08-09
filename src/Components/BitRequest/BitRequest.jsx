import React, { useState, useEffect } from 'react';
import styles from './BitRequest.module.scss';

const BitRequest = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');
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
      throw new Error('Failed to refresh token');
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

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth('https://dar.kg/api/v1/listings/bit/');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setNotification({ message: 'Ошибка загрузки заявок', type: 'error', visible: true });
      }
    } catch {
      setNotification({ message: 'Ошибка загрузки заявок', type: 'error', visible: true });
    } finally {
      setIsLoading(false);
      setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      const response = await fetchWithAuth(`https://dar.kg/api/v1/listings/bit/${id}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setRequests(requests.filter(request => request.id !== id));
        setNotification({ message: 'Заявка удалена', type: 'success', visible: true });
      } else {
        setNotification({ message: 'Ошибка удаления заявки', type: 'error', visible: true });
      }
    } catch {
      setNotification({ message: 'Ошибка удаления заявки', type: 'error', visible: true });
    }
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <section className={styles.bitRequest}>
      <div className={styles.bitRequest__container}>
        <h2 className={styles.bitRequest__title}>Заявки</h2>
        {isLoading ? (
          <div className={styles.bitRequest__loading}>Загрузка...</div>
        ) : requests.length === 0 ? (
          <div className={styles.bitRequest__empty}>Заявки отсутствуют</div>
        ) : (
          <div className={styles.bitRequest__list}>
            {requests.map((request) => (
              <div key={request.id} className={styles.bitRequest__item}>
                <div className={styles.bitRequest__item_content}>
                  <p><strong>Имя:</strong> {request.name || 'Не указано'}</p>
                  <p><strong>Телефон:</strong> {request.contact_phone || 'Не указано'}</p>
                  <p><strong>Сообщение:</strong> {request.message || 'Не указано'}</p>
                  <p><strong>Создано:</strong> {new Date(request.created_at).toLocaleString('ru-RU')}</p>
                </div>
                <button
                  onClick={() => handleDeleteRequest(request.id)}
                  className={`${styles.bitRequest__button} ${styles['bitRequest__button--delete']}`}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        {notification.visible && (
          <div className={`${styles.bitRequest__notification} ${styles[`notification--${notification.type}`]}`}>
            {notification.message}
          </div>
        )}
      </div>
    </section>
  );
};

export default BitRequest;