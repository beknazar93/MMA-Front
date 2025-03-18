import React, { useState, useEffect, useMemo } from "react";
import { addClient } from "../../api/API";

function AddClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "Abytov247@gmail.com", // Фиксированный email
    phone: "",
    stage: "",
    trainer: "",
    sport_category: "",
    year: "2025", // Фиксированный год
    month: "",
    day: "",
    comment: "",
    payment: "",
    price: "",
  });

  const [loading, setLoading] = useState(false);

  const trainers = useMemo(() => [
    "Азизбек Уулу Баяман", "Анарбаев Акжол", "Асанбаев Эрлан",
    "Жумалы Уулу Ариет", "Калмамат Уулу Акай", "Лукас Крабб",
    "Маматжанов Марлен", "Машрапов Жумабай", "Машрапов Тилек",
    "Медербек Уулу Сафармурат", "Минбаев Сулайман", "Мойдунов Мирлан",
    "Пазылов Кутман", "Тажибаев Азамат", "Тургунов Ислам"
  ], []);

  const sports = useMemo(() => [
    "Бокс", "Борьба", "Греко-римская борьба", "Дзюдо", "Кикбокс",
    "Кроссфит", "Кулату", "Самбо", "Тхэквондо"
  ], []);

  const months = useMemo(() => [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ], []);

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => (i + 1).toString()), []);

  // Универсальный обработчик изменения инпутов (исключаем фиксированные поля)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email" || name === "year") return; // Запрещаем изменение email и года
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addClient(formData);
      alert("Клиент добавлен успешно!");
      setFormData({
        name: "",
        email: "Abytov247@gmail.com", // Оставляем фиксированным
        phone: "",
        stage: "",
        trainer: "",
        sport_category: "",
        year: "2025", // Оставляем фиксированным
        month: "",
        day: "",
        comment: "",
        payment: "",
        price: "",
      });
    } catch (error) {
      alert("Ошибка при добавлении клиента. Проверьте данные и повторите попытку.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      <div className="client-form__grid">
        <input
          className="client-form__input"
          type="text"
          name="name"
          placeholder="Имя"
          aria-label="Имя клиента"
          autoComplete="off"
          value={formData.name}
          onChange={handleInputChange}
        />

        <input
          className="client-form__input"
          type="tel"
          name="phone"
          placeholder="Телефон"
          aria-label="Телефон клиента"
          autoComplete="off"
          value={formData.phone}
          onChange={handleInputChange}
        />

        {/* Фиксированный Email */}
        <input
          className="client-form__input"
          type="email"
          name="email"
          value={formData.email}
          readOnly
          required
        />
        <input type="hidden" name="email" value={formData.email} />

        <select
          className="client-form__select"
          name="stage"
          value={formData.stage}
          onChange={handleInputChange}
        >
          <option value="">Выберите этап</option>
          <option value="Ученик">Ученик</option>
          <option value="Ученица">Ученица</option>
        </select>

        <select
          className="client-form__select"
          name="trainer"
          value={formData.trainer}
          onChange={handleInputChange}
        >
          <option value="">Выберите тренера</option>
          {trainers.map((trainer, index) => (
            <option key={index} value={trainer}>{trainer}</option>
          ))}
        </select>

        <select
          className="client-form__select"
          name="sport_category"
          value={formData.sport_category}
          onChange={handleInputChange}
        >
          <option value="">Выберите вид спорта</option>
          {sports.map((sport, index) => (
            <option key={index} value={sport}>{sport}</option>
          ))}
        </select>

        <select
          className="client-form__select"
          name="month"
          value={formData.month}
          onChange={handleInputChange}
        >
          <option value="">Месяц</option>
          {months.map((month, index) => (
            <option key={index} value={month}>{month}</option>
          ))}
        </select>

        {/* Фиксированный Год */}
        <input
          className="client-form__input"
          type="text"
          name="year"
          value={formData.year}
          readOnly
          required
        />
        <input type="hidden" name="year" value={formData.year} />

        <select
          className="client-form__select"
          name="day"
          value={formData.day}
          onChange={handleInputChange}
        >
          <option value="">День</option>
          {days.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>

        <input
          className="client-form__input"
          type="number"
          name="price"
          placeholder="Цена"
          value={formData.price}
          onChange={handleInputChange}
        />

        <select
          className="client-form__select"
          name="payment"
          value={formData.payment}
          onChange={handleInputChange}
        >
          <option value="">Оплата</option>
          <option value="Оплачено">Оплачено</option>
          <option value="Не оплачено">Не оплачено</option>
        </select>

        <textarea
          className="client-form__textarea"
          name="comment"
          placeholder="Комментарий"
          value={formData.comment}
          onChange={handleInputChange}
        />
      </div>

      <button className="client-form__button" type="submit" disabled={loading}>
        {loading ? "Добавление..." : "Добавить клиента"}
      </button>
    </form>
  );
}

export default AddClient;
