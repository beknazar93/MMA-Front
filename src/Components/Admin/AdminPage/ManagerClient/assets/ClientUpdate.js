import React, { useState, useEffect } from "react";
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
  }); 
  const [editId, setEditId] = useState(null); 
  const [formData, setFormData] = useState({}); 
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const trainers = [

    "Азизбек Уулу Баяман",
    "Анарбаев Акжол",
    "Асанбаев Эрлан",
    "Жумалы Уулу Ариет",
    "Калмамат Уулу Акай",
    "Лукас Крабб",
    "Маматжанов Марлен",
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
  const years = Array.from({ length: 1 }, (_, i) => 2025 - i); 
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());


  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsData = await fetchClients(); 
        setClients(clientsData);
      } catch (error) {
        setError("Ошибка загрузки данных клиентов.");
      } finally {
        setLoading(false);
      }
    };
    loadClients(); 
  }, []); 


  const filteredClients = clients.filter((client) => {
    return (
      (!filters.name ||
        client.name.toLowerCase().includes(filters.name.toLowerCase())) && 
      (!filters.trainer || client.trainer === filters.trainer) && 
      (!filters.sport_category ||
        client.sport_category === filters.sport_category) && 
      (!filters.day || client.day === filters.day) && 
      (!filters.month || client.month === filters.month) && 
      (!filters.year || client.year === filters.year) 
    );
  });


  const handleEditClick = (client) => {
    setEditId(client.id); 
    setFormData(client); 
    setIsModalOpen(true); 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, 
    }));
  };

  const handleSave = async () => {
    try {
      await updateClient(editId, formData); 
      alert("Данные клиента успешно обновлены!"); 
      setEditId(null);
      setIsModalOpen(false); 
      setClients((prevClients) =>
        prevClients.map(
          (client) =>
            client.id === editId ? { ...client, ...formData } : client
        )
      );
    } catch (error) {
      alert("Ошибка при обновлении данных клиента."); 
    }
  };


  const handleCancel = () => {
    setEditId(null); 
    setIsModalOpen(false); 
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
        <div className="client-list__loading">Загрузка...</div> 
      ) : error ? (
        <div className="client-list__error">Ошибка: {error}</div> 
      ) : (
        <div className="client-list__cards">

          {filteredClients
            .slice()
            .reverse()
            .map((client) => (
              <div key={client.id} className="client-card">
                <p className="client-card__name">{client.name}</p>{" "}

                <button
                  onClick={() => handleEditClick(client)}
                  className="client-card__details-button "
                >
                  Изменить
                </button>{" "}
                
              </div>
            ))}
        </div>
      )}

      {isModalOpen && (
        <div className="client-modal">
          <div className="client-modal__content">
            <button className="client-modal__close" onClick={handleCancel}>
              ×
            </button>
            <h2 className="client-modal__title">Редактирование клиента</h2>
            <div className="client-modal__form">
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="Имя"
                className="client-modal__input"
              />
              <input
                type="tel"
                pattern="[0-9]{10}"
                title="Введите номер телефона длиной из 10 цифр"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                placeholder="Телефон"
                className="client-modal__input"
              />
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="Email"
                className="client-modal__input"
              />
              <select
                name="stage"
                value={formData.stage || ""}
                onChange={handleChange}
                className="client-modal__select"
              >
                <option value="" disabled>
                  Выберите этап
                </option>
                <option value="Ученик">Ученик</option>
                <option value="Ученица">Ученица</option>
              </select>
              <select
                name="trainer"
                value={formData.trainer || ""}
                onChange={handleChange}
                className="client-modal__select"
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
                name="sport_category"
                value={formData.sport_category || ""}
                onChange={handleChange}
                className="client-modal__select"
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
                name="year"
                value={formData.year || ""}
                onChange={handleChange}
                className="client-modal__select"
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
                className="client-modal__select"
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
                className="client-modal__select"
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
              <select
                name="payment"
                value={formData.payment || ""}
                onChange={handleChange}
                className="client-modal__select"
              >
                <option value="" disabled>
                  Выберите статус оплаты
                </option>
                <option value="Оплачено">Оплачено</option>
                <option value="Не оплачено">Не оплачено</option>
              </select>
              <input
                type="number"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                placeholder="Цена"
                className="client-modal__input"
              />
              <textarea
                name="comment"
                value={formData.comment || ""}
                onChange={handleChange}
                placeholder="Комментарий"
                className="client-modal__textarea"
              />
              <div className="client-modal__actions">
                <button
                  onClick={handleSave}
                  className="client-modal__button client-modal__button--save"
                >
                  Сохранить
                </button>
                <button
                  onClick={handleCancel}
                  className="client-modal__button client-modal__button--cancel"
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
