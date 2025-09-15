import { useState, useEffect } from "react";
import axios from "axios";
import "./Users.scss";

const BASE_URL = "https://testosh.pythonanywhere.com/api";
const REFRESH_URL = `${BASE_URL}/token/refresh/`;

const axiosInstance = axios.create({ baseURL: BASE_URL });

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
        const refresh = localStorage.getItem("refresh");
        const { data } = await axios.post(REFRESH_URL, { refresh });
        localStorage.setItem("access", data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return axiosInstance(originalRequest);
      } catch (e) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/admin";
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

/* ===== cache ===== */
let usersCache = { data: null, timestamp: 0 };

const fetchUsers = async () => {
  const now = Date.now();
  if (usersCache.data && now - usersCache.timestamp < 60_000) {
    return usersCache.data;
  }
  try {
    const { data } = await axiosInstance.get("/users/");
    usersCache = { data, timestamp: now };
    return data;
  } catch (error) {
    throw new Error(
      `Ошибка загрузки пользователей: ${error.response?.data?.detail || error.message}`
    );
  }
};

const updateUser = async (id, user) => {
  try {
    const { data } = await axiosInstance.put(`/users/${id}/`, {
      username: user.username,
      email: user.email,
      role: user.role,
    });
    return data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    throw new Error(`Ошибка при обновлении пользователя: ${message}`);
  }
};

const deleteUser = async (id) => {
  try {
    await axiosInstance.delete(`/users/${id}/`);
    return true;
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    throw new Error(`Ошибка при удалении пользователя: ${message}`);
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
    const load = async () => {
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
    load();
  }, []);

  const validateUserData = (u) => {
    if (!u?.username?.trim()) return "Имя пользователя обязательно.";
    if (!u?.email?.trim()) return "Email обязателен.";
    if (!/\S+@\S+\.\S+/.test(u.email)) return "Некорректный email.";
    if (!u?.role) return "Выберите роль.";
    return "";
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!modal.user) return;

    const msg = validateUserData(modal.user);
    if (msg) return setError(msg);

    setLoading(true);
    try {
      const updated = await updateUser(modal.user.id, modal.user);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      usersCache.data = null;
      setModal({ type: "", user: null });
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    setLoading(true);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      usersCache.data = null;
      setModal({ type: "", user: null });
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, user = null) => {
    setModal({
      type,
      user: user ? { id: user.id, username: user.username || "", email: user.email || "", role: user.role || "" } : null,
    });
    setError("");
  };

  const closeModal = () => {
    setModal({ type: "", user: null });
    setError("");
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModal((prev) => ({ ...prev, user: { ...prev.user, [name]: value } }));
  };

  return (
    <div className="users">
      <h2 className="users__title">Пользователи</h2>

      {error && <p className="users__error" role="alert">{error}</p>}

      {loading ? (
        <div className="users__loader" aria-label="Загрузка..." />
      ) : users.length ? (
        <div className="users__table-container">
          <table className="users__table">
            <thead>
              <tr className="users__table-header">
                <th>Имя пользователя</th>
                <th>Роль</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr className="users__table-row" key={user.id}>
                  <td>{user.username || "-"}</td>
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

      {/* EDIT MODAL */}
      {modal.type === "edit" && modal.user && (
        <div className="users__modal" role="dialog" aria-modal="true">
          <div className="users__modal-content">
            <h3>Редактировать пользователя</h3>
            <form onSubmit={handleEditUser}>
              <input
                type="text"
                name="username"
                value={modal.user.username}
                onChange={handleModalChange}
                placeholder="Имя пользователя"
                required
                className="users__modal-input"
              />
              <input
                type="email"
                name="email"
                value={modal.user.email}
                onChange={handleModalChange}
                placeholder="Email"
                required
                className="users__modal-input"
              />
              <select
                name="role"
                value={modal.user.role}
                onChange={handleModalChange}
                required
                className="users__modal-input"
              >
                <option value="">Выберите роль</option>
                <option value="admin">Администратор</option>
                <option value="client_manager">Менеджер</option>
              </select>

              <div className="users__modal-buttons">
                <button type="submit" className="users__modal-btn" disabled={loading}>
                  {loading ? "Сохранение..." : "Сохранить"}
                </button>
                <button type="button" onClick={closeModal} className="users__modal-btn" disabled={loading}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modal.type === "delete" && modal.user && (
        <div className="users__modal" role="dialog" aria-modal="true">
          <div className="users__modal-content">
            <h3>Удалить пользователя</h3>
            <p>Вы уверены, что хотите удалить «{modal.user.username}»?</p>
            <div className="users__modal-buttons">
              <button
                onClick={() => handleDeleteUser(modal.user.id)}
                disabled={loading}
                className="users__modal-btn users__modal-btn--delete"
              >
                {loading ? "Удаление..." : "Удалить"}
              </button>
              <button type="button" onClick={closeModal} className="users__modal-btn" disabled={loading}>
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
