import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import styles from './Login.module.scss';

const Login = ({ onLogin, language = 'ru' }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  const navigate = useNavigate();
  const intl = useIntl();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '', visible: false });

    try {
      const response = await fetch('https://dar.kg/api/v1/users/auth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        // Request user data
        const userResponse = await fetch('https://dar.kg/api/v1/users/me/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.access}`,
          },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          localStorage.setItem('user', JSON.stringify(userData));
          setNotification({
            message: intl.formatMessage({ id: 'login_success', defaultMessage: 'Успешный вход! Перенаправление...' }),
            type: 'success',
            visible: true,
          });
          onLogin();
          setTimeout(() => navigate('/dashboard/profile'), 1000);
        } else {
          throw new Error(intl.formatMessage({ id: 'error_user_data', defaultMessage: 'Не удалось получить данные пользователя' }));
        }
      } else {
        const errorData = await response.json();
        setNotification({
          message: intl.formatMessage(
            { id: 'error_login', defaultMessage: 'Ошибка: {detail}' },
            { detail: errorData.detail || intl.formatMessage({ id: 'invalid_credentials', defaultMessage: 'Неверные учетные данные' }) }
          ),
          type: 'error',
          visible: true,
        });
        setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
      }
    } catch (err) {
      setNotification({
        message: intl.formatMessage({ id: 'error_try_again', defaultMessage: 'Ошибка: Попробуйте снова' }),
        type: 'error',
        visible: true,
      });
      setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
    }
  };

  return (
    <div className={styles.login}>
      <h2 className={styles.login__title}>
        {intl.formatMessage({ id: 'login', defaultMessage: 'Вход' })}
      </h2>
      <form onSubmit={handleSubmit} className={styles.login__form}>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder={intl.formatMessage({ id: 'username_placeholder', defaultMessage: 'Имя пользователя' })}
          className={styles.login__input}
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={intl.formatMessage({ id: 'password_placeholder', defaultMessage: 'Пароль' })}
          className={styles.login__input}
          required
        />
        {notification.visible && (
          <div className={`${styles.login__notification} ${styles[`login__notification--${notification.type}`]}`}>
            {notification.message}
          </div>
        )}
        <button type="submit" className={styles.login__button}>
          {intl.formatMessage({ id: 'login_button', defaultMessage: 'Войти' })}
        </button>
      </form>
    </div>
  );
};

export default Login;