import React, { useState } from 'react';
import styles from './Register.module.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password2: '',
    role: '',
    avatar: null,
  });
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('Нет токена обновления');
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
      throw new Error('Не удалось обновить токен');
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('access_token');
    if (!token) {
      try {
        token = await refreshToken();
      } catch {
        setNotification({ message: 'Ошибка: Токен не найден или недействителен', type: 'error', visible: true });
        return null;
      }
    }
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      try {
        token = await refreshToken();
        headers.Authorization = `Bearer ${token}`;
        return await fetch(url, { ...options, headers });
      } catch {
        setNotification({ message: 'Ошибка: Токен не найден или недействителен', type: 'error', visible: true });
        return null;
      }
    }
    return response;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Введите имя пользователя';
    if (!formData.email) newErrors.email = 'Введите email';
    if (!formData.first_name) newErrors.first_name = 'Введите имя';
    if (!formData.last_name) newErrors.last_name = 'Введите фамилию';
    if (!formData.phone) newErrors.phone = 'Введите телефон';
    if (!formData.password) newErrors.password = 'Введите пароль';
    if (!formData.password2) newErrors.password2 = 'Подтвердите пароль';
    if (!formData.role) newErrors.role = 'Выберите роль';
    if (formData.password && formData.password2 && formData.password !== formData.password2) {
      newErrors.password2 = 'Пароли не совпадают';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files[0]) {
      setFormData({ ...formData, avatar: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
      setErrors({ ...errors, avatar: '' });
    } else {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '', visible: false });

    if (!validateForm()) {
      setNotification({ message: 'Заполните все обязательные поля', type: 'error', visible: true });
      setTimeout(() => setNotification({ message: '', type: '', visible: false }), 5000);
      return;
    }

    const endpoint = formData.role === 'realtor'
      ? 'https://dar.kg/api/v1/users/create-realtor/'
      : 'https://dar.kg/api/v1/users/register/';

    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('first_name', formData.first_name);
    formDataToSend.append('last_name', formData.last_name);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('password2', formData.password2);
    if (formData.avatar) formDataToSend.append('avatar', formData.avatar);

    try {
      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: formDataToSend,
      });
      if (response && response.ok) {
        setNotification({ message: 'Регистрация успешно завершена!', type: 'success', visible: true });
        setFormData({ username: '', email: '', first_name: '', last_name: '', phone: '', password: '', password2: '', role: '', avatar: null });
        setErrors({});
        setPreviewImage(null);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.detail ||
          Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ') ||
          'Обязательное поле отсутствует или неверный формат';
        setNotification({ message: `Ошибка: ${errorMessage}`, type: 'error', visible: true });
      }
    } catch {
      setNotification({ message: 'Ошибка: Не удалось выполнить регистрацию', type: 'error', visible: true });
    }
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 5000);
  };

  return (
    <section className={styles.register}>
      <div className={styles.register__container}>
        <h2 className={styles.register__title}>Регистрация</h2>
        <form onSubmit={handleSubmit} className={styles.register__form}>
          <div className={styles.register__section}>
            <h3 className={styles.register__subtitle}>Личные данные</h3>
            <div className={styles.form__row}>
              <div className={styles.form__group}>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Имя пользователя"
                  className={`${styles.form__input} ${errors.username ? styles['form__input--error'] : ''}`}
                  required
                />
                {errors.username && <span className={styles.form__error}>{errors.username}</span>}
              </div>
              <div className={styles.form__group}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={`${styles.form__input} ${errors.email ? styles['form__input--error'] : ''}`}
                  required
                />
                {errors.email && <span className={styles.form__error}>{errors.email}</span>}
              </div>
            </div>
            <div className={styles.form__row}>
              <div className={styles.form__group}>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Имя"
                  className={`${styles.form__input} ${errors.first_name ? styles['form__input--error'] : ''}`}
                  required
                />
                {errors.first_name && <span className={styles.form__error}>{errors.first_name}</span>}
              </div>
              <div className={styles.form__group}>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Фамилия"
                  className={`${styles.form__input} ${errors.last_name ? styles['form__input--error'] : ''}`}
                  required
                />
                {errors.last_name && <span className={styles.form__error}>{errors.last_name}</span>}
              </div>
            </div>
            <div className={styles.form__row}>
              <div className={styles.form__group}>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Телефон"
                  className={`${styles.form__input} ${errors.phone ? styles['form__input--error'] : ''}`}
                  required
                />
                {errors.phone && <span className={styles.form__error}>{errors.phone}</span>}
              </div>
              <div className={styles.form__group}>
                <label className={styles.form__label}>Аватар</label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleChange}
                  className={styles.form__file}
                />
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Превью аватара"
                    className={styles.form__preview}
                  />
                )}
                {errors.avatar && <span className={styles.form__error}>{errors.avatar}</span>}
              </div>
            </div>
          </div>
          <div className={styles.register__section}>
            <h3 className={styles.register__subtitle}>Роль и Пароль</h3>
            <div className={styles.form__row}>
              <div className={styles.form__group}>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`${styles.form__select} ${errors.role ? styles['form__select--error'] : ''}`}
                  required
                >
                  <option value="" disabled>Выберите роль</option>
                  <option value="realtor">Агент по недвижимости</option>
                  <option value="admin">Админ</option>
                </select>
                {errors.role && <span className={styles.form__error}>{errors.role}</span>}
              </div>
              <div className={styles.form__group}>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Пароль"
                  className={`${styles.form__input} ${errors.password ? styles['form__input--error'] : ''}`}
                  required
                />
                {errors.password && <span className={styles.form__error}>{errors.password}</span>}
              </div>
            </div>
            <div className={styles.form__row}>
              <div className={styles.form__group}>
                <input
                  type="password"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  placeholder="Подтверждение пароля"
                  className={`${styles.form__input} ${errors.password2 ? styles['form__input--error'] : ''}`}
                  required
                />
                {errors.password2 && <span className={styles.form__error}>{errors.password2}</span>}
              </div>
              <div className={styles.form__group}></div>
            </div>
          </div>
          {notification.visible && (
            <div className={`${styles.notification} ${styles[`notification--${notification.type}`]}`}>
              {notification.message}
            </div>
          )}
          <button type="submit" className={styles.form__button}>
            <svg viewBox="0 0 24 24" className={styles.form__button_icon}>
              <path d="M12 5v14m-7-7h14" />
            </svg>
            Зарегистрироваться
          </button>
        </form>
      </div>
    </section>
  );
};

export default Register;