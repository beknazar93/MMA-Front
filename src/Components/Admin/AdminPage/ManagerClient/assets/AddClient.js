import React, { useState, useMemo, useEffect } from "react";
import { addClient, fetchClients } from "../../api/API";

function AddClient() {
  const getManagerName = () => localStorage.getItem("manager_name") || "Unknown Manager";
  const managerName = getManagerName();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    stage: "",
    trainer: "",
    sport_category: "",
    year: "2025",
    month: "",
    day: "",
    comment: "",
    payment: "",
    price: "",
    sale: "",
    check_field: "",
  });

  const [invalidFields, setInvalidFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);

  const trainers = useMemo(
    () => [
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
    ],
    []
  );

  const sports = useMemo(
    () => [
      "Бокс",
      "Борьба",
      "Греко-римская борьба",
      "Дзюдо",
      "Кикбокс",
      "Кроссфит",
      "Кулату",
      "Самбо",
      "Тхэквондо",
    ],
    []
  );

  const months = useMemo(
    () => [
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
    ],
    []
  );

  const days = useMemo(
    () => Array.from({ length: 31 }, (_, i) => (i + 1).toString()),
    []
  );

  const timeSlots = useMemo(
    () => [
      "09:00",
      "10:00",
      "10:30",
      "12:00",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
      "19:00",
      "20:00",
    ],
    []
  );

  const checkFieldOptions = useMemo(
    () => ["От знакомых", "Из соцсетей"],
    []
  );

  const saleOptions = useMemo(
    () => ["15%", "20%", "Без скидки"],
    []
  );

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsData = await fetchClients();
        setClients(clientsData);
      } catch (error) {
        console.error("Ошибка загрузки клиентов:", error);
      }
    };
    loadClients();
  }, []);

  const validateForm = () => {
    const requiredFields = [
      "name",
      "phone",
      "email",
      "stage",
      "trainer",
      "sport_category",
      "month",
      "day",
      "payment",
      "price",
      "check_field",
      "sale",
    ];

    const invalid = requiredFields.filter((key) => !formData[key] || formData[key].trim() === "");

    if (formData.price && (isNaN(formData.price) || formData.price <= 0)) {
      invalid.push("price");
    }

    setInvalidFields(invalid);
    return invalid.length === 0;
  };

  const checkForDuplicate = () => {
    const { name, month, year, sport_category } = formData;
    return clients.some((client) =>
      client.name.toLowerCase() === name.toLowerCase() &&
      client.month.toLowerCase() === month.toLowerCase() &&
      client.year === year &&
      client.sport_category.toLowerCase() === sport_category.toLowerCase()
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "year") return;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setInvalidFields([]);
  };

  const calculateDiscountedPrice = () => {
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) return formData.price;

    if (formData.sale === "15%") {
      return (price * 0.85).toFixed(2);
    } else if (formData.sale === "20%") {
      return (price * 0.80).toFixed(2);
    } else {
      return price.toString();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    if (checkForDuplicate()) {
      alert("Клиент с таким именем, месяцем, годом и видом спорта уже существует!");
      return;
    }

    setLoading(true);

    try {
      const updatedComment = formData.comment
        ? `${formData.comment}\n(Добавил: ${managerName})`
        : `(Добавил: ${managerName})`;

      const updatedFormData = {
        ...formData,
        comment: updatedComment,
        price: calculateDiscountedPrice(),
      };

      await addClient(updatedFormData);
      alert("Клиент успешно добавлен!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        stage: "",
        trainer: "",
        sport_category: "",
        year: "2025",
        month: "",
        day: "",
        comment: "",
        payment: "",
        price: "",
        sale: "",
        check_field: "",
      });
      setInvalidFields([]);
      const clientsData = await fetchClients();
      setClients(clientsData);
    } catch (error) {
      alert("Ошибка при добавлении клиента. Проверьте данные и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      <div className="client-form__grid">
        <div className="client-form__field">
          <input
            className={`client-form__input ${invalidFields.includes("name") ? "error" : ""}`}
            type="text"
            name="name"
            placeholder="Имя"
            aria-label="Имя клиента"
            autoComplete="off"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>

        <div className="client-form__field">
          <input
            className={`client-form__input ${invalidFields.includes("phone") ? "error" : ""}`}
            type="text"
            name="phone"
            placeholder="Телефон"
            aria-label="Телефон клиента"
            autoComplete="off"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>

        <div className="client-form__field">
          <select
            className={`client-form__select ${invalidFields.includes("sport_category") ? "error" : ""}`}
            name="sport_category"
            value={formData.sport_category}
            onChange={handleInputChange}
          >
            <option value="">Спорт</option>
            {sports.map((sport, index) => (
              <option key={index} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </div>

        <div className="client-form__field">
          <select
            className={`client-form__select ${invalidFields.includes("trainer") ? "error" : ""}`}
            name="trainer"
            value={formData.trainer}
            onChange={handleInputChange}
          >
            <option value="">Тренер</option>
            {trainers.map((trainer, index) => (
              <option key={index} value={trainer}>
                {trainer}
              </option>
            ))}
          </select>
        </div>

        <div className="client-form__field">
          <select
            className={`client-form__select ${invalidFields.includes("email") ? "error" : ""}`}
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          >
            <option value="">Время</option>
            {timeSlots.map((time, index) => (
              <option key={index} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="client-form__field">
          <select
            className={`client-form__select ${invalidFields.includes("check_field") ? "error" : ""}`}
            name="check_field"
            value={formData.check_field}
            onChange={handleInputChange}
          >
            <option value="">Источник</option>
            {checkFieldOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="client-form__field">
          <select
            className={`client-form__select ${invalidFields.includes("stage") ? "error" : ""}`}
            name="stage"
            value={formData.stage}
            onChange={handleInputChange}
          >
            <option value="">Пол</option>
            <option value="Мужской">Мужской</option>
            <option value="Женский">Женский</option>
          </select>
        </div>

        <div className="client-form__field">
          <input
            className="client-form__input"
            type="text"
            name="year"
            value={formData.year}
            readOnly
          />
          <input type="hidden" name="year" value={formData.year} />
        </div>

        <div className="client-form__field">
          <select
            className={`client-form__select ${invalidFields.includes("month") ? "error" : ""}`}
            name="month"
            value={formData.month}
            onChange={handleInputChange}
          >
            <option value="">Месяц</option>
            {months.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="client-form__field">
          <select
            className={`client-form__select ${invalidFields.includes("day") ? "error" : ""}`}
            name="day"
            value={formData.day}
            onChange={handleInputChange}
          >
            <option value="">День</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="client-form__field">
          <input
            className={`client-form__input ${invalidFields.includes("price") ? "error" : ""}`}
            type="number"
            name="price"
            placeholder="Цена"
            value={formData.price}
            onChange={handleInputChange}
          />
        </div>

        <div className="client-form__field">
          <select
            className={`client-form__select ${invalidFields.includes("sale") ? "error" : ""}`}
            name="sale"
            value={formData.sale}
            onChange={handleInputChange}
          >
            <option value="">Скидка</option>
            {saleOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="client-form__field">
          <select
            className={`client-form__select ${invalidFields.includes("payment") ? "error" : ""}`}
            name="payment"
            value={formData.payment}
            onChange={handleInputChange}
          >
            <option value="">Оплата</option>
            <option value="Оплачено">Оплачено</option>
            <option value="Не оплачено">Не оплачено</option>
          </select>
        </div>

        <div className="client-form__field">
          <textarea
            className={`client-form__textarea ${invalidFields.includes("comment") ? "error" : ""}`}
            name="comment"
            placeholder="Комментарий"
            value={formData.comment}
            onChange={handleInputChange}
          />
        </div>

        <div className="client-form__field">
          <p className="client-form__price-display">
            Итоговая цена: {formData.price ? `${calculateDiscountedPrice()} сом` : "Не указана"}
          </p>
        </div>
      </div>

      <button
        className="client-form__button"
        type="submit"
        disabled={loading}
      >
        {loading ? "Добавление..." : "Добавить клиента"}
      </button>
    </form>
  );
}

export default AddClient;