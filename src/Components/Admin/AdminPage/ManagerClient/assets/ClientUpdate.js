import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchClients, updateClient } from "../../api/API";
import ClientFilter from "./ClientFilter";

function ClientUpdate() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    trainer: "",
    sport_category: "",
    day: "",
    month: "",
    year: "",
    payment: "",
  });
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [isPriceEditable, setIsPriceEditable] = useState(false);
  const [isSaleEditable, setIsSaleEditable] = useState(false);

  const CORRECT_PIN = "4444";

  const trainers = [
    "Абдыкадыров Султан",
    "Азизбек Уулу Баяман",
    "Асанбаев Эрлан",
    "Жумалы Уулу Ариет",
    "Калмамат Уулу Акай",
    "Лукас Крабб",
    "Машрапов Жумабай",
    "Машрапов Тилек",
    "Медербек Уулу Сафармурат",
    "Минбаев Сулайман",
    "Мойдунов Мирлан",
    "Пазылов Кутман",
    "Тажибаев Азамат",
    "Тургунов Ислам",
  ];
  const sports = [
    "Бокс",
    "Борьба",
    "Греко-римская борьба",
    "Дзюдо",
    "Кикбокс",
    "Кроссфит",
    "Кулату",
    "Самбо",
    "Тхэквондо",
  ];
  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  const years = useMemo(() => Array.from({ length: 1 }, (_, i) => 2025 - i), []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => (i + 1).toString()), []);
  const checkFieldOptions = ["От знакомых", "Из соцсетей"];
  const timeSlots = [
    "09:00", "10:00", "10:30", "12:00", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "20:00"
  ];
  const saleOptions = ["15%", "20%", "Без скидки"];

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const clientsData = await fetchClients();
      setClients(clientsData);
      setError(null);
    } catch (error) {
      setError("Ошибка загрузки данных клиентов.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    return clients
      .filter((client) => {
        return (
          (!filters.name || client.name.toLowerCase().includes(filters.name.toLowerCase())) &&
          (!filters.trainer || client.trainer === filters.trainer) &&
          (!filters.sport_category || client.sport_category === filters.sport_category) &&
          (!filters.day || client.day === filters.day) &&
          (!filters.month || client.month === filters.month) &&
          (!filters.year || client.year === filters.year) &&
          (!filters.payment || client.payment === filters.payment)
        );
      })
      .reverse();
  }, [clients, filters]);

  const handleEditClick = (client) => {
    setEditId(client.id);
    setFormData(client);
    setIsModalOpen(true);
    setIsPriceEditable(false);
    setIsSaleEditable(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" && !isPriceEditable) {
      setIsPinModalOpen(true);
      return;
    }
    if (name === "sale" && !isSaleEditable) {
      setIsPinModalOpen(true);
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePinSubmit = () => {
    if (pinInput === CORRECT_PIN) {
      setIsPriceEditable(true);
      setIsSaleEditable(true);
      setIsPinModalOpen(false);
      setPinInput("");
      setPinError("");
    } else {
      setPinError("Неверный PIN-код.");
    }
  };

  const handlePinCancel = () => {
    setIsPinModalOpen(false);
    setPinInput("");
    setPinError("");
  };

  const handleSave = async () => {
    try {
      // Рассчитываем цену с учетом скидки
      let updatedPrice = parseFloat(formData.price) || 0;
      if (formData.sale === "15%") {
        updatedPrice = updatedPrice * 0.85;
      } else if (formData.sale === "20%") {
        updatedPrice = updatedPrice * 0.80;
      }
      const updatedFormData = {
        ...formData,
        price: updatedPrice.toFixed(2),
      };

      await updateClient(editId, updatedFormData);
      alert("Данные клиента успешно обновлены!");
      setEditId(null);
      setIsModalOpen(false);
      setClients((prevClients) =>
        prevClients.map(
          (client) =>
            client.id === editId ? { ...client, ...updatedFormData } : client
        )
      );
    } catch (error) {
      alert("Ошибка при обновлении данных клиента.");
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setIsModalOpen(false);
    setIsPriceEditable(false);
    setIsSaleEditable(false);
  };

  return (
    <div className="client-list">
      <ClientFilter
        filters={filters}
        setFilters={setFilters}
        trainers={trainers}
        sports={sports}
        months={months}
        years={years}
        days={days}
      />

      {loading ? (
        <div className="client-list__loading-message">Загрузка...</div>
      ) : error ? (
        <div className="client-list__error-message">Ошибка: {error}</div>
      ) : (
        <div className="client-list__cards">
          {filteredClients.map((client) => (
            <div key={client.id} className="client-list__card">
              <p
                className="client-list__card-name"
                onClick={() => handleEditClick(client)}
              >
                {client.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="client-list__modal">
          <div className="client-list__modal-content">
            <button className="client-list__modal-close" onClick={handleCancel}>
              ×
            </button>
            <h2 className="client-list__modal-title">Редактирование клиента</h2>
            <div className="client-list__modal-form">
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="Имя"
                className="client-list__modal-input"
              />
              <input
                type="tel"
                pattern="[0-9]{10}"
                title="Введите номер телефона длиной из 10 цифр"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                placeholder="Телефон"
                className="client-list__modal-input"
              />
              <select
                name="sport_category"
                value={formData.sport_category || ""}
                onChange={handleChange}
                className="client-list__modal-select"
              >
                <option value="" disabled>
                  Выберите категорию спорта
                </option>
                {sports.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
              <select
                name="trainer"
                value={formData.trainer || ""}
                onChange={handleChange}
                className="client-list__modal-select"
              >
                <option value="" disabled>
                  Выберите тренера
                </option>
                {trainers.map((trainer) => (
                  <option key={trainer} value={trainer}>
                    {trainer}
                  </option>
                ))}
              </select>
              <select
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="client-list__modal-select"
              >
                <option value="" disabled>
                  Выберите время
                </option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <select
                name="check_field"
                value={formData.check_field || ""}
                onChange={handleChange}
                className="client-list__modal-select"
              >
                <option value="" disabled>
                  Выберите источник
                </option>
                {checkFieldOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                name="stage"
                value={formData.stage || ""}
                onChange={handleChange}
                className="client-list__modal-select"
              >
                <option value="" disabled>
                  Выберите пол
                </option>
                <option value="Мужской">Мужской</option>
                <option value="Женский">Женский</option>
              </select>
              <select
                name="year"
                value={formData.year || ""}
                onChange={handleChange}
                className="client-list__modal-select"
              >
                <option value="" disabled>
                  Выберите год
                </option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                name="month"
                value={formData.month || ""}
                onChange={handleChange}
                className="client-list__modal-select"
              >
                <option value="" disabled>
                  Выберите месяц
                </option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                name="day"
                value={formData.day || ""}
                onChange={handleChange}
                className="client-list__modal-select"
              >
                <option value="" disabled>
                  Выберите день
                </option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <div className="client-list__price-field">
                <input
                  type="number"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleChange}
                  placeholder="Цена"
                  className="client-list__modal-input client-list__modal-input--price"
                  disabled={!isPriceEditable}
                  style={{ width: "100%", height: "34px" }}
                />
                {!isPriceEditable && (
                  <svg
                    onClick={() => setIsPinModalOpen(true)}
                    className="client-list__unlock-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4a90e2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  </svg>
                )}
              </div>
              <div className="client-list__sale-field">
                <select
                  name="sale"
                  value={formData.sale || ""}
                  onChange={handleChange}
                  className="client-list__modal-select"
                  disabled={!isSaleEditable}
                >
                  <option value="" disabled>
                    Выберите скидку
                  </option>
                  {saleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {!isSaleEditable && (
                  <svg
                    onClick={() => setIsPinModalOpen(true)}
                    className="client-list__unlock-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4a90e2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  </svg>
                )}
              </div>
              <select
                name="payment"
                value={formData.payment || ""}
                onChange={handleChange}
                className="client-list__modal-select"
              >
                <option value="" disabled>
                  Выберите статус оплаты
                </option>
                <option value="Оплачено">Оплачено</option>
                <option value="Не оплачено">Не оплачено</option>
              </select>
              <textarea
                name="comment"
                value={formData.comment || ""}
                onChange={handleChange}
                placeholder="Комментарий"
                className="client-list__modal-textarea"
              />
              <div className="client-list__modal-actions">
                <button
                  onClick={handleSave}
                  className="client-list__modal-button client-list__modal-button--save"
                >
                  Сохранить
                </button>
                <button
                  onClick={handleCancel}
                  className="client-list__modal-button client-list__modal-button--cancel"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPinModalOpen && (
        <div className="client-list__modal client-list__modal--pin">
          <div className="client-list__modal-content">
            <button className="client-list__modal-close" onClick={handlePinCancel}>
              ×
            </button>
            <h2 className="client-list__modal-title">Введите PIN-код</h2>
            <div className="client-list__modal-form">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN-код"
                className="client-list__modal-input"
              />
              {pinError && <p className="client-list__error-message">{pinError}</p>}
              <div className="client-list__modal-actions">
                <button
                  onClick={handlePinSubmit}
                  className="client-list__modal-button client-list__modal-button--save"
                >
                  Подтвердить
                </button>
                <button
                  onClick={handlePinCancel}
                  className="client-list__modal-button client-list__modal-button--cancel"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientUpdate;