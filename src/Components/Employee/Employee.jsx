import React, { useState, useEffect } from 'react';
import styles from './Employee.module.scss';

const Employee = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  const [editUser, setEditUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: '',
  });

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
      setNotification({ message: 'Требуется авторизация', type: 'error', visible: true });
      setLoading(false);
      return null;
    }
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      try {
        token = await refreshToken();
        headers.Authorization = `Bearer ${token}`;
        return await fetch(url, { ...options, headers });
      } catch {
        setNotification({ message: 'Ошибка: Не удалось обновить токен', type: 'error', visible: true });
        setLoading(false);
        return null;
      }
    }
    return response;
  };

  const fetchUsers = async () => {
    try {
      const response = await fetchWithAuth('https://dar.kg/api/v1/users/list/');
      if (response && response.ok) {
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } else {
        setNotification({ message: 'Ошибка загрузки пользователей', type: 'error', visible: true });
        setLoading(false);
      }
    } catch {
      setNotification({ message: 'Ошибка: Не удалось загрузить пользователей', type: 'error', visible: true });
      setLoading(false);
    }
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
  };

  const handleEditClick = (user) => {
    setEditUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
    });
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetchWithAuth(`https://dar.kg/api/v1/users/users/${editUser.id}/edit/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (response && response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => (u.id === editUser.id ? updatedUser : u)));
        setNotification({ message: 'Пользователь успешно обновлен', type: 'success', visible: true });
        setEditUser(null);
      } else {
        setNotification({ message: 'Ошибка обновления пользователя', type: 'error', visible: true });
      }
    } catch {
      setNotification({ message: 'Ошибка: Не удалось обновить пользователя', type: 'error', visible: true });
    }
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
  };

  const handleDeleteClick = (userId) => {
    setDeleteUserId(userId);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetchWithAuth(`https://dar.kg/api/v1/users/users/${deleteUserId}/delete/`, {
        method: 'DELETE',
      });
      if (response && response.ok) {
        setUsers(users.filter(u => u.id !== deleteUserId));
        setNotification({ message: 'Пользователь успешно удален', type: 'success', visible: true });
      } else {
        setNotification({ message: 'Ошибка удаления пользователя', type: 'error', visible: true });
      }
    } catch {
      setNotification({ message: 'Ошибка: Не удалось удалить пользователя', type: 'error', visible: true });
    }
    setDeleteUserId(null);
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (notification.visible && users.length === 0) {
    return (
      <div className={`${styles.notification} ${styles[`notification--${notification.type}`]}`}>
        {notification.message}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Сотрудники</h1>
      <div className={styles.card__wrapper}>
        {users.map(user => (
          <div key={user.id} className={styles.card}>
            <div className={styles.card__header}>
              <img 
                src={user.avatar || 'https://via.placeholder.com/40'} 
                alt={`${user.first_name} ${user.last_name}`} 
                className={styles.card__avatar}
              />
              <div className={styles.card__name}>
                {`${user.first_name} ${user.last_name}`.trim() || 'Без имени'}
              </div>
            </div>
            <div className={styles.card__info}>
              <div className={styles.card__field}>
                <span className={styles.card__label}>Логин:</span>
                <span>@{user.username}</span>
              </div>
              <div className={styles.card__field}>
                <span className={styles.card__label}>Телефон:</span>
                <span>{user.phone || 'Не указано'}</span>
              </div>
              <div className={styles.card__field}>
                <span className={styles.card__label}>Роль:</span>
                <span>{user.role === 'realtor' ? 'Риелтор' : 'Админ'}</span>
              </div>
            </div>
            <div className={styles.card__actions}>
              <button 
                className={`${styles.button} ${styles['button--edit']}`}
                onClick={() => handleEditClick(user)}
              >
                Изменить
              </button>
              <button 
                className={`${styles.button} ${styles['button--delete']}`}
                onClick={() => handleDeleteClick(user.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {editUser && (
        <div className={styles.modal}>
          <div className={styles.modal__content}>
            <h2 className={styles.modal__title}>Редактировать сотрудника</h2>
            <div className={styles.modal__form}>
              <div className={styles.form__group}>
                <label className={styles.form__label}>Имя пользователя</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className={styles.form__input}
                />
              </div>
              <div className={styles.form__group}>
                <label className={styles.form__label}>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={styles.form__input}
                />
              </div>
              <div className={styles.form__group}>
                <label className={styles.form__label}>Имя</label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className={styles.form__input}
                />
              </div>
              <div className={styles.form__group}>
                <label className={styles.form__label}>Фамилия</label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className={styles.form__input}
                />
              </div>
              <div className={styles.form__group}>
                <label className={styles.form__label}>Телефон</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className={styles.form__input}
                />
              </div>
              <div className={styles.form__group}>
                <label className={styles.form__label}>Роль</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className={styles.form__select}
                >
                  <option value="admin">Админ</option>
                  <option value="realtor">Риелтор</option>
                </select>
              </div>
            </div>
            <div className={styles.modal__actions}>
              <button
                className={`${styles.button} ${styles['button--cancel']}`}
                onClick={() => setEditUser(null)}
              >
                Отмена
              </button>
              <button
                className={`${styles.button} ${styles['button--confirm']}`}
                onClick={handleEditSubmit}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteUserId && (
        <div className={styles.modal}>
          <div className={styles.modal__content}>
            <h2 className={styles.modal__title}>Подтверждение удаления</h2>
            <p className={styles.modal__text}>Вы уверены, что хотите удалить этого пользователя?</p>
            <div className={styles.modal__actions}>
              <button
                className={`${styles.button} ${styles['button--cancel']}`}
                onClick={() => setDeleteUserId(null)}
              >
                Отмена
              </button>
              <button
                className={`${styles.button} ${styles['button--delete']}`}
                onClick={handleDeleteConfirm}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.visible && (
        <div className={`${styles.notification} ${styles[`notification--${notification.type}`]}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Employee;