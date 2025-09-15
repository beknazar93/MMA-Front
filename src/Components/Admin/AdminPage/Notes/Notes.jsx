import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaSignOutAlt,
  FaSortUp,
  FaSortDown,
  FaPlus,
  FaEdit,
} from "react-icons/fa";
import "./Notes.scss";

const API_URL = "https://testosh.pythonanywhere.com/api/notes/";

const Notes = () => {
  const navigate = useNavigate();

  const [managerName] = useState(
    localStorage.getItem("manager_name") || "Неизвестный менеджер"
  );
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState({ id: null, text: "", date: "", time: "" });
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "time", order: "asc" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  });

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: authHeaders() });
      if (!res.ok) throw new Error("Ошибка загрузки заметок");
      const data = await res.json();
      setNotes(data);
    } catch (e) {
      alert("Ошибка загрузки заметок.");
      // console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.text || !note.date || !note.time) {
      alert("Заполните все поля.");
      return;
    }

    setLoading(true);
    try {
      const isEdit = Boolean(note.id);
      const url = isEdit ? `${API_URL}${note.id}/` : API_URL;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          text: note.text,
          date: note.date,
          time: note.time,
        }),
      });

      if (!res.ok)
        throw new Error(`Ошибка ${isEdit ? "обновления" : "добавления"} заметки`);

      const payload = await res.json();
      setNotes((prev) =>
        isEdit ? prev.map((n) => (n.id === note.id ? payload : n)) : [...prev, payload]
      );

      setNote({ id: null, text: "", date: "", time: "" });
      setIsModalOpen(false);
      alert(`Заметка ${isEdit ? "обновлена" : "добавлена"}!`);
    } catch {
      alert(`Ошибка ${note.id ? "обновления" : "добавления"} заметки.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (n) => {
    setNote({ id: n.id, text: n.text, date: n.date, time: n.time });
    setIsModalOpen(true);
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Удалить заметку?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Ошибка удаления заметки");
      setNotes((prev) => prev.filter((n) => n.id !== id));
      alert("Заметка удалена!");
    } catch {
      alert("Ошибка удаления заметки.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    const order = sortConfig.key === key && sortConfig.order === "asc" ? "desc" : "asc";
    setSortConfig({ key, order });

    setNotes((prev) => {
      const arr = [...prev];
      arr.sort((a, b) => {
        const A = key === "text" ? (a[key] || "").toLowerCase() : a[key] || "";
        const B = key === "text" ? (b[key] || "").toLowerCase() : b[key] || "";
        if (A < B) return order === "asc" ? -1 : 1;
        if (A > B) return order === "asc" ? 1 : -1;
        return 0;
      });
      return arr;
    });
  };

  const isOverdue = (dateStr) => dateStr && new Date(dateStr) < new Date();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/admin");
  };

  return (
    <div className="notes">
      {/* шапка менеджера берёт стиль из AdminManager.scss */}
      <div className="admin-manager__header">
        <span className="admin-manager__manager-name">{managerName}</span>
        <button
          className="admin-manager__logout-btn"
          onClick={handleLogout}
          aria-label="Выйти"
        >
          <FaSignOutAlt />
        </button>
      </div>

      <div className="notes__header">
        <h3 className="notes__title">Заметки</h3>
        <button
          className="notes__add-btn"
          onClick={() => setIsModalOpen(true)}
          aria-label="Добавить заметку"
        >
          <FaPlus /> Добавить
        </button>
      </div>

      {isModalOpen && (
        <div className="notes__modal-overlay">
          <div className="notes__modal">
            <form className="notes__form" onSubmit={handleSubmit}>
              <h3 className="notes__modal-title">
                {note.id ? "Редактировать заметку" : "Новая заметка"}
              </h3>

              <div className="notes__form-content">
                <textarea
                  name="text"
                  value={note.text}
                  onChange={handleInputChange}
                  placeholder="Описание задачи"
                  className="notes__textarea"
                  aria-label="Описание задачи"
                />
                <div className="notes__date-group">
                  <div className="notes__input-wrapper">
                    <label className="notes__label">Дата создания</label>
                    <input
                      type="date"
                      name="date"
                      value={note.date}
                      onChange={handleInputChange}
                      className="notes__input"
                      aria-label="Дата создания"
                    />
                  </div>
                  <div className="notes__input-wrapper">
                    <label className="notes__label">Дата выполнения</label>
                    <input
                      type="date"
                      name="time"
                      value={note.time}
                      onChange={handleInputChange}
                      className="notes__input"
                      aria-label="Дата выполнения"
                    />
                  </div>
                </div>
              </div>

              <div className="notes__modal-actions">
                <button
                  type="submit"
                  className={`notes__btn ${loading ? "notes__btn--loading" : ""}`}
                  disabled={loading}
                  aria-label={note.id ? "Обновить заметку" : "Добавить заметку"}
                >
                  {loading ? <span className="notes__spinner" /> : note.id ? "Обновить" : "Добавить"}
                </button>
                <button
                  type="button"
                  className="notes__btn notes__btn--cancel"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNote({ id: null, text: "", date: "", time: "" });
                  }}
                  disabled={loading}
                  aria-label="Отмена"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="notes__list">
        {loading ? (
          <div className="notes__loader" />
        ) : notes.length ? (
          <table className="notes__table">
            <thead>
              <tr>
                <th className="notes__table-header" onClick={() => handleSort("text")}>
                  Задача {sortConfig.key === "text" && (sortConfig.order === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
                <th className="notes__table-header" onClick={() => handleSort("date")}>
                  Дата создания {sortConfig.key === "date" && (sortConfig.order === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
                <th className="notes__table-header" onClick={() => handleSort("time")}>
                  Дата выполнения {sortConfig.key === "time" && (sortConfig.order === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
                <th className="notes__table-header">Действия</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n, idx) => (
                <tr
                  key={n.id}
                  className={`notes__table-row ${isOverdue(n.time) ? "notes__table-row--overdue" : ""}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <td className="notes__table-cell">{n.text || "-"}</td>
                  <td className="notes__table-cell">{n.date || "-"}</td>
                  <td className="notes__table-cell notes__table-cell--due">{n.time || "-"}</td>
                  <td className="notes__table-cell notes__table-cell--actions">
                    <button
                      className="notes__edit-btn"
                      onClick={() => handleEditNote(n)}
                      disabled={loading}
                      aria-label="Редактировать заметку"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="notes__delete-btn"
                      onClick={() => handleDeleteNote(n.id)}
                      disabled={loading}
                      aria-label="Удалить заметку"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="notes__empty">Нет заметок</p>
        )}
      </div>
    </div>
  );
};

export default Notes;
