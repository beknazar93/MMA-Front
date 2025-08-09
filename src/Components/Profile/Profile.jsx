import React, { useState, useEffect } from 'react';
import styles from './Profile.module.scss';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: '',
    avatar: '',
  });
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

  const fetchProfile = async () => {
    try {
      const response = await fetchWithAuth('https://dar.kg/api/v1/users/me/');
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          ...data,
          avatar: data.avatar ? `https://dar.kg${data.avatar}` : '',
        });
      } else {
        setNotification({ message: 'Ошибка загрузки профиля', type: 'error', visible: true });
      }
    } catch {
      setNotification({ message: 'Ошибка: Токен не найден или недействителен', type: 'error', visible: true });
    }
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <section className={styles.profile}>
      <div className={styles.profile__container}>
        <h2 className={styles.profile__title}>Ваш профиль</h2>
        <article className={styles.profile__article}>
          <div className={styles.profile__header}>
            <div className={styles.profile__avatar}>
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Avatar" className={styles.profile__avatar_image} />
              ) : (
                profileData.first_name ? profileData.first_name[0] : 'U'
              )}
            </div>
            <div className={styles.profile__header_info}>
              <h3 className={styles.profile__name}>
                {profileData.first_name || profileData.last_name
                  ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()
                  : 'Без имени'}
              </h3>
              <p className={styles.profile__role}>
                {profileData.role ? (profileData.role === 'realtor' ? 'Риелтор' : 'Админ') : 'Роль не указана'}
              </p>
            </div>
          </div>
          <h4 className={styles.profile__subtitle}>Информация о профиле</h4>
          <div className={styles.profile__info}>
            <div className={styles.profile__field}>
              <span className={styles.profile__label}>Имя пользователя</span>
              <span className={styles.profile__value}>{profileData.username || 'Не указано'}</span>
            </div>
            <div className={styles.profile__field}>
              <span className={styles.profile__label}>Email</span>
              <span className={styles.profile__value}>{profileData.email || 'Не указано'}</span>
            </div>
            <div className={styles.profile__field}>
              <span className={styles.profile__label}>Телефон</span>
              <span className={styles.profile__value}>{profileData.phone || 'Не указано'}</span>
            </div>
          </div>
        </article>
        {notification.visible && (
          <div className={`${styles.profile__notification} ${styles[`notification--${notification.type}`]}`}>
            {notification.message}
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;