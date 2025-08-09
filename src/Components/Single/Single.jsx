import React, { useState, useEffect } from 'react';
import styles from './Single.module.scss';

const Single = () => {
  const [complexes, setComplexes] = useState([]);
  const [newComplex, setNewComplex] = useState('');
  const [editingComplex, setEditingComplex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      setNotification({ message: 'Нет refresh токена', type: 'error' });
      throw new Error('Нет refresh токена');
    }
    const response = await fetch('https://dar.kg/api/v1/users/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    }
    setNotification({ message: 'Ошибка обновления токена', type: 'error' });
    throw new Error('Ошибка обновления токена');
  };

  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('access_token');
    if (!token) {
      try {
        token = await refreshToken();
      } catch (err) {
        return { ok: false, status: 401 };
      }
    }
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    let response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      try {
        token = await refreshToken();
        headers.Authorization = `Bearer ${token}`;
        response = await fetch(url, { ...options, headers });
      } catch (err) {
        return { ok: false, status: 401 };
      }
    }
    return response;
  };

  const fetchComplexes = async () => {
    try {
      const response = await fetchWithAuth('https://dar.kg/api/v1/listings/single-field/');
      if (response.ok) {
        const data = await response.json();
        setComplexes(data);
      } else {
        setNotification({ message: 'Ошибка загрузки комплексов: ' + response.status, type: 'error' });
      }
    } catch (err) {
      setNotification({ message: 'Ошибка загрузки комплексов: ' + err.message, type: 'error' });
    }
  };

  useEffect(() => {
    fetchComplexes();
  }, []);

  const handleAddComplex = async (e) => {
    e.preventDefault();
    if (!newComplex.trim()) {
      setNotification({ message: 'Введите название комплекса', type: 'error' });
      return;
    }
    try {
      const response = await fetchWithAuth('https://dar.kg/api/v1/listings/single-field/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newComplex })
      });
      if (response.ok) {
        setNewComplex('');
        setNotification({ message: 'Комплекс успешно добавлен', type: 'success' });
        fetchComplexes();
      } else {
        setNotification({ message: 'Ошибка добавления комплекса: ' + response.status, type: 'error' });
      }
    } catch (err) {
      setNotification({ message: 'Ошибка: ' + err.message, type: 'error' });
    }
  };

  const handleEditComplex = async (id) => {
    if (!editingValue.trim()) {
      setNotification({ message: 'Введите новое название комплекса', type: 'error' });
      return;
    }
    try {
      const response = await fetchWithAuth(`https://dar.kg/api/v1/listings/single-field/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: editingValue })
      });
      if (response.ok) {
        setEditingComplex(null);
        setEditingValue('');
        setNotification({ message: 'Комплекс успешно обновлен', type: 'success' });
        fetchComplexes();
      } else {
        setNotification({ message: 'Ошибка обновления комплекса: ' + response.status, type: 'error' });
      }
    } catch (err) {
      setNotification({ message: 'Ошибка: ' + err.message, type: 'error' });
    }
  };

  const handleDeleteComplex = async (id) => {
    try {
      const response = await fetchWithAuth(`https://dar.kg/api/v1/listings/single-field/${id}/`, {
        method: 'DELETE'
      });
      if (response.ok || response.status === 204) {
        setNotification({ message: 'Комплекс успешно удален', type: 'success' });
        fetchComplexes();
      } else {
        setNotification({ message: 'Ошибка удаления комплекса: ' + response.status, type: 'error' });
      }
    } catch (err) {
      setNotification({ message: 'Ошибка: ' + err.message, type: 'error' });
    }
  };

  const startEditing = (complex) => {
    setEditingComplex(complex.id);
    setEditingValue(complex.value);
  };

  const cancelEditing = () => {
    setEditingComplex(null);
    setEditingValue('');
  };

  return (
    <div className={styles.single}>
      <div className={styles['single__container']}>
        <h1 className={styles['single__title']}>Комплекс</h1>
        <div className={styles['single__form_section']}>
          <h2 className={styles['single__subtitle']}>Добавить новый комплекс</h2>
          <form onSubmit={handleAddComplex} className={styles['single__form']}>
            <div className={styles['single__input_group']}>
              <input
                type="text"
                value={newComplex}
                onChange={(e) => setNewComplex(e.target.value)}
                placeholder="Название комплекса"
                className={styles['single__input']}
              />
              <button type="submit" className={styles['single__button']}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
        <div className={styles['single__list_section']}>
          <h2 className={styles['single__subtitle']}>Список комплексов</h2>
          {complexes.length > 0 ? (
            <div className={styles['single__list']}>
              {complexes.map(complex => (
                <div key={complex.id} className={styles['single__item']}>
                  <div className={styles['single__item_icon']}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3-9H9v-2h6v2z"/>
                    </svg>
                  </div>
                  {editingComplex === complex.id ? (
                    <div className={styles['single__input_group']}>
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className={styles['single__input']}
                      />
                      <button
                        className={styles['single__button']}
                        onClick={() => handleEditComplex(complex.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                        </svg>
                      </button>
                      <button
                        className={`${styles['single__button']} ${styles['single__button--delete']}`}
                        onClick={cancelEditing}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={styles['single__item_text']}>{complex.value}</div>
                      <button
                        className={styles['single__button']}
                        onClick={() => startEditing(complex)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button
                        className={`${styles['single__button']} ${styles['single__button--delete']}`}
                        onClick={() => handleDeleteComplex(complex.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles['single__empty']}>Нет комплексов</div>
          )}
        </div>
        {notification.message && (
          <div className={`${styles['single__notification']} ${styles[`single__notification--${notification.type}`]}`}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Single;