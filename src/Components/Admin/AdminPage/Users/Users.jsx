
import { useState, useEffect } from "react";
import axios from "axios";
import "./Users.scss";

const BASE_URL = "https://testosh.pythonanywhere.com/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh");
        const response = await axios.post(`${BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        const newAccessToken = response.data.access;
        localStorage.setItem("access", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/admin";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

let usersCache = {
  data: null,
  timestamp: 0,
};

const fetchUsers = async () => {
  const now = Date.now();
  if (usersCache.data && now - usersCache.timestamp < 60000) {
    return usersCache.data;
  }

  try {
    const response = await axiosInstance.get("/users/");
    usersCache = {
      data: response.data,
      timestamp: now,
    };
    return response.data;
  } catch (error) {
    throw new Error(
      `Ошибка загрузки пользователей: ${error.response?.data?.detail || error.message}`
    );
  }
};

const updateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(`/users/${id}/`, userData);
    return response.data;
  } catch (error) {
    throw new Error(
      `Ошибка при обновлении пользователя: ${error.response?.data?.detail || error.message}`
    );
  }
};

const deleteUser = async (id) => {
  try {
    await axiosInstance.delete(`/users/${id}/`);
    return true;
  } catch (error) {
    throw new Error(
      `Ошибка при удалении пользователя: ${error.response?.data?.detail || error.message}`
    );
  }
};

const roleDisplayMap = {
  admin: "Администратор",
  client_manager: "Менеджер",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ type: "", user: null });

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const validateUserData = (data) => {
    if (!data.username?.trim()) return "Имя пользователя обязательно.";
    if (!data.email?.trim()) return "Email обязателен.";
    if (!/\S+@\S+\.\S+/.test(data.email)) return "Некорректный email.";
    return "";
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    const validationError = validateUserData(modal.user);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateUser(modal.user.id, {
        username: modal.user.username,
        email: modal.user.email,
        role: modal.user.role,
      });
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      usersCache.data = null;
      setModal({ type: "", user: null });
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    setLoading(true);
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      usersCache.data = null;
      setModal({ type: "", user: null });
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, user = null) => {
    setModal({
      type,
      user: user ? { ...user } : null,
    });
    setError("");
  };

  const closeModal = () => {
    setModal({ type: "", user: null });
    setError("");
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModal((prev) => ({
      ...prev,
      user: { ...prev.user, [name]: value },
    }));
  };

  return (
    <div className="users">
      <h2 className="users__title">Пользователи</h2>
      {error && <p className="users__error">{error}</p>}
      {loading ? (
        <div className="users__loader" />
      ) : users.length > 0 ? (
        <div className="users__table-container">
          <table className="users__table">
            <thead>
              <tr className="users__table-header">
                <th>Имя пользователя</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr className="users__table-row" key={user.id}>
                  <td>{user.username || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>{roleDisplayMap[user.role] || "-"}</td>
                  <td>
                    {user.id !== 1 && (
                      <>
                        <button
                          onClick={() => openModal("edit", user)}
                          className="users__edit-btn"
                          disabled={loading}
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => openModal("delete", user)}
                          disabled={loading}
                          className="users__delete-btn"
                        >
                          {loading ? "Удаление..." : "Удалить"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="users__empty">Нет пользователей</p>
      )}

      {modal.type === "edit" && modal.user && (
        <div className="users__modal">
          <div className="users__modal-content">
            <h3>Редактировать пользователя</h3>
            <form onSubmit={handleEditUser}>
              <input
                type="text"
                name="username"
                value={modal.user.username || ""}
                onChange={handleModalChange}
                placeholder="Имя пользователя"
                required
                className="users__modal-input"
              />
              <input
                type="email"
                name="email"
                value={modal.user.email || ""}
                onChange={handleModalChange}
                placeholder="Email"
                required
                className="users__modal-input"
              />
              <select
                name="role"
                value={modal.user.role || ""}
                onChange={handleModalChange}
                required
                className="users__modal-input"
              >
                <option value="">Выберите роль</option>
                <option value="admin">Администратор</option>
                <option value="client_manager">Менеджер</option>
              </select>
              <div className="users__modal-buttons">
                <button
                  type="submit"
                  className="users__modal-btn"
                  disabled={loading}
                >
                  {loading ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="users__modal-btn"
                  disabled={loading}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal.type === "delete" && modal.user && (
        <div className="users__modal">
          <div className="users__modal-content">
            <h3>Удалить пользователя</h3>
            <p>Вы уверены, что хотите удалить "{modal.user.username}"?</p>
            <div className="users__modal-buttons">
              <button
                onClick={() => handleDeleteUser(modal.user.id)}
                disabled={loading}
                className="users__modal-btn users__modal-btn--delete"
              >
                {loading ? "Удаление..." : "Удалить"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="users__modal-btn"
                disabled={loading}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
