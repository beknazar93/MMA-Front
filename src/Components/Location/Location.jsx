import React, { useState, useEffect } from 'react';
import styles from './Location.module.scss';

const Location = () => {
  const [formData, setFormData] = useState({ city: '', district: '' });
  const [locations, setLocations] = useState([]);
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
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      token = await refreshToken();
      headers.Authorization = `Bearer ${token}`;
      return await fetch(url, { ...options, headers });
    }
    return response;
  };

  const fetchLocations = async () => {
    try {
      const response = await fetchWithAuth('https://dar.kg/api/v1/listings/locations/list/');
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      } else {
        setNotification({ message: 'Ошибка загрузки', type: 'error', visible: true });
        setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
      }
    } catch {
      setNotification({ message: 'Ошибка загрузки', type: 'error', visible: true });
      setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth('https://dar.kg/api/v1/listings/locations/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setNotification({ message: 'Локация добавлена', type: 'success', visible: true });
        setFormData({ city: '', district: '' });
        fetchLocations();
      } else {
        setNotification({ message: 'Ошибка добавления', type: 'error', visible: true });
      }
      setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
    } catch {
      setNotification({ message: 'Ошибка добавления', type: 'error', visible: true });
      setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetchWithAuth(`https://dar.kg/api/v1/listings/locations/${id}/delete/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setLocations(locations.filter(location => location.id !== id));
        setNotification({ message: 'Локация удалена', type: 'success', visible: true });
      } else {
        setNotification({ message: 'Ошибка удаления', type: 'error', visible: true });
      }
      setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
    } catch {
      setNotification({ message: 'Ошибка удаления', type: 'error', visible: true });
      setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
    }
  };

  return (
    <section className={styles.location}>
      <div className={styles.location__container}>
        <h2 className={styles.location__title}>Локация</h2>
        <div className={styles.location__form_section}>
          <h3 className={styles.location__subtitle}>Добавить локацию</h3>
          <form onSubmit={handleSubmit} className={styles.location__form}>
            <div className={styles.location__input_group}>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Город"
                className={styles.location__input}
                required
              />
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Район"
                className={styles.location__input}
                required
              />
            </div>
            <button type="submit" className={styles.location__button}>
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14m-7-7h14" />
              </svg>
            </button>
          </form>
        </div>
        <div className={styles.location__list_section}>
          <h3 className={styles.location__subtitle}>Список локаций</h3>
          {locations.length > 0 ? (
            <div className={styles.location__list}>
              {locations.map((location) => (
                <div key={location.id} className={styles.location__item}>
                  <span className={styles.location__item_icon}>
                    <svg viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <span className={styles.location__item_text}>
                    {location.city}, {location.district}
                  </span>
                  <button
                    className={`${styles.location__button} ${styles['location__button--delete']}`}
                    onClick={() => handleDelete(location.id)}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.location__empty}>Нет локаций</div>
          )}
        </div>
        {notification.visible && (
          <div className={`${styles.location__notification} ${styles[`notification--${notification.type}`]}`}>
            {notification.message}
          </div>
        )}
      </div>
    </section>
  );
};

export default Location;