import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { addClient, fetchClients, updateClient, deleteClient } from "../../api/API";
import { trainers, sports, months, days, years, checkFieldOptions, timeSlots, saleOptions, renewalOptions, CORRECT_PIN, paymentOptions, errorMessages } from "../../Constants/constants";
import './ClientManager.scss'
// Мок-данные для демонстрации
const typeClients = ["Обычный", "Пробный", "Индивидуальный", "Абонемент"];
const mockClients = [
  { id: 1, name: "Иван Иванов", phone: "996123456789", sport_category: "Футбол", trainer: "Алексей", email: "10:00", check_field: "Сайт", stage: "Мужской", day: "01", month: "Январь", year: "2025", dataCassa: "2025-01-01", typeClient: "Абонемент", price: "1000", sale: "15%", payment: "Оплачено", comment: "Тест" },
  { id: 2, name: "Мария Петрова", phone: "996987654321", sport_category: "Йога", trainer: "Елена", email: "12:00", check_field: "Соцсети", stage: "Женский", day: "02", month: "Февраль", year: "2025", dataCassa: "2025-02-01", typeClient: "Пробный", price: "500", sale: "", payment: "Не оплачено", comment: "" }
];

const InputField = ({ name, value, onChange, type = "text", placeholder, className, readOnly, disabled }) => (
  <input
    type={type}
    name={name}
    value={value || ""}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-teal-500 focus:bg-gray-700 transition ${className || ""}`}
    readOnly={readOnly}
    disabled={disabled}
    aria-label={placeholder}
  />
);

const SelectField = ({ name, value, onChange, options, placeholder, className, disabled }) => (
  <select
    name={name}
    value={value || ""}
    onChange={onChange}
    className={`w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-teal-500 focus:bg-gray-700 transition ${className || ""}`}
    disabled={disabled}
    aria-label={placeholder}
  >
    <option value="" disabled>{placeholder}</option>
    {options.map(option => <option key={option} value={option}>{option}</option>)}
  </select>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full">
        <button className="absolute top-2 right-2 text-white text-xl" onClick={onClose} aria-label="Закрыть">×</button>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};

const DateFields = ({ formData, onChange, disabled, isEditing }) => (
  <div className="flex flex-wrap gap-2">
    {isEditing ? (
      <>
        <SelectField name="day" value={formData.day} onChange={onChange} options={days} placeholder="День" disabled={disabled} />
        <SelectField name="month" value={formData.month} onChange={onChange} options={months} placeholder="Месяц" disabled={disabled} />
        <SelectField name="year" value={formData.year} onChange={onChange} options={years} placeholder="Год" disabled={true} />
        <InputField name="dataCassa" value={formData.dataCassa} onChange={onChange} type="date" placeholder="Дата кассы" disabled={disabled} />
      </>
    ) : (
      <span>{formData.day || "-"} {formData.month || "-"} {formData.year || "-"} | {formData.dataCassa || "-"}</span>
    )}
  </div>
);

const BarChart = ({ data, title }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const maxValue = Math.max(...data.values, 1);
    const barWidth = ctx.canvas.width / data.values.length;
    const heightScale = ctx.canvas.height / maxValue;

    data.values.forEach((value, index) => {
      ctx.fillStyle = "#00cc99";
      ctx.fillRect(index * barWidth, ctx.canvas.height - value * heightScale, barWidth - 5, value * heightScale);
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Inter";
      ctx.fillText(data.labels[index], index * barWidth + 10, ctx.canvas.height - 10);
      ctx.fillText(value, index * barWidth + 10, ctx.canvas.height - value * heightScale - 10);
    });
  }, [data]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <canvas ref={canvasRef} width="300" height="200" />
    </div>
  );
};

const ClientManager = () => {
  const managerName = localStorage.getItem("manager_name") || "Unknown Manager";
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", stage: "", trainer: "", sport_category: "",
    year: "2025", month: "", day: "", comment: "", payment: "", price: "", sale: "", check_field: "",
    dataCassa: "", typeClient: ""
  });
  const [invalidFields, setInvalidFields] = useState([]);
  const [clients, setClients] = useState(mockClients);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ name: "", trainer: "", sport_category: "", day: "", month: "", year: "", typeClient: "", payment: "" });
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState("1");

  const formFieldConfig = [
    { name: "name", type: "text", placeholder: "Имя", required: true },
    { name: "phone", type: "tel", placeholder: "Телефон", required: true },
    { name: "sport_category", type: "select", placeholder: "Спорт", options: sports, required: true },
    { name: "trainer", type: "select", placeholder: "Тренер", options: trainers, required: true },
    { name: "email", type: "select", placeholder: "Время", options: timeSlots },
    { name: "year", type: "select", placeholder: "Год", options: years, readOnly: true },
    { name: "month", type: "select", placeholder: "Месяц", options: months, required: true },
    { name: "day", type: "select", placeholder: "День", options: days },
    { name: "comment", type: "textarea", placeholder: "Комментарий" },
    { name: "payment", type: "select", placeholder: "Оплата", options: paymentOptions.map(opt => opt.value), required: true },
    { name: "price", type: "number", placeholder: "Цена", required: true },
    { name: "sale", type: "select", placeholder: "Скидка", options: saleOptions },
    { name: "check_field", type: "select", placeholder: "Источник", options: checkFieldOptions }
  ];

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const clientsData = await fetchClients();
        setClients(clientsData);
      } catch (error) {
        console.error("Ошибка загрузки клиентов:", error);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
    return () => setClients([]);
  }, []);

  const validateForm = () => {
    const invalid = formFieldConfig
      .filter(field => field.required && (!formData[field.name] || formData[field.name].trim() === ""))
      .map(field => field.name);
    if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) <= 0)) invalid.push("price");
    if (!formData.dataCassa) invalid.push("dataCassa");
    if (!formData.typeClient) invalid.push("typeClient");
    setInvalidFields([...new Set(invalid)]);
    return invalid.length === 0;
  };

  const checkForDuplicate = () => {
    const { name, month, year, sport_category } = formData;
    return clients.some(client =>
      client.name.trim().toLowerCase() === name.trim().toLowerCase() &&
      client.month.trim().toLowerCase() === month.trim().toLowerCase() &&
      client.year === year &&
      client.sport_category.trim().toLowerCase() === sport_category.trim().toLowerCase()
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "year") return;
    setFormData(prev => ({
      ...prev,
      [name]: name === "phone" ? value.replace(/\D/g, "") : name === "price" ? value.replace(/[^0-9.]/g, "") : value
    }));
    setInvalidFields(prev => prev.filter(field => field !== name));
  };

  const calculateDiscountedPrice = () => {
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) return "";
    if (formData.sale === "15%") return (price * 0.85).toFixed(2);
    if (formData.sale === "20%") return (price * 0.80).toFixed(2);
    return price.toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Заполните корректно все обязательные поля.");
      return;
    }
    if (checkForDuplicate()) {
      alert(errorMessages.duplicateClient);
      return;
    }
    setLoading(true);
    try {
      const updatedComment = formData.comment
        ? `${formData.comment.trim()}\n(Добавил: ${managerName})`
        : `(Добавил: ${managerName})`;
      const updatedFormData = {
        ...formData,
        comment: updatedComment,
        price: calculateDiscountedPrice()
      };
      await addClient(updatedFormData);
      alert("Клиент успешно добавлен!");
      setFormData({
        name: "", email: "", phone: "", stage: "", trainer: "", sport_category: "",
        year: "2025", month: "", day: "", comment: "", payment: "", price: "", sale: "", check_field: "",
        dataCassa: "", typeClient: ""
      });
      setInvalidFields([]);
      const clientsData = await fetchClients();
      setClients(clientsData);
    } catch (error) {
      console.error("Ошибка добавления клиента:", error);
      alert(errorMessages.addClientError);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clients
      .filter(client => (
        (!filters.name || client.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.trainer || client.trainer === filters.trainer) &&
        (!filters.sport_category || client.sport_category === filters.sport_category) &&
        (!filters.day || client.day === filters.day) &&
        (!filters.month || client.month === filters.month) &&
        (!filters.year || client.year === filters.year) &&
        (!filters.typeClient || client.typeClient === filters.typeClient) &&
        (!filters.payment || filters.payment.split(',').includes(client.payment))
      ))
      .reverse();
  }, [clients, filters]);

  const getClientActivePeriods = useMemo(() => {
    if (!selectedClient) return { count: 0, periods: [] };
    const clientRecords = clients.filter(client => client.name.toLowerCase() === selectedClient.name.toLowerCase());
    const uniquePeriods = [...new Set(clientRecords.filter(client => client.month && client.year).map(client => `${client.month} ${client.year}`))];
    return { count: uniquePeriods.length, periods: uniquePeriods };
  }, [selectedClient, clients]);

  const generateRenewalPeriods = (client, monthsToAdd) => {
    const periods = [];
    const currentMonthIndex = client.month ? months.indexOf(client.month) : 0;
    const currentYearNum = client.year ? parseInt(client.year) : 2025;
    const currentDay = client.day || "01";
    for (let i = 1; i <= monthsToAdd; i++) {
      const totalMonths = currentMonthIndex + i;
      const newMonthIndex = totalMonths % 12;
      const yearsToAdd = Math.floor(totalMonths / 12);
      const newMonth = months[newMonthIndex];
      const newYear = (currentYearNum + yearsToAdd).toString();
      periods.push({ month: newMonth, year: newYear, day: currentDay });
    }
    return periods;
  };

  const handleAction = (action, client) => {
    switch (action) {
      case "edit":
        setModalState({ type: "pin", data: { action: "edit", id: client.id, client } });
        setPinInput("");
        setPinError("");
        break;
      case "delete":
        setModalState({ type: "pin", data: { action: "delete", id: client.id } });
        setPinInput("");
        setPinError("");
        break;
      case "renewal":
        setModalState({ type: "renewal", data: client });
        setSelectedMonths("1");
        break;
      default:
        return;
    }
  };

  const handlePinSubmit = () => {
    if (pinInput !== CORRECT_PIN) {
      setPinError(errorMessages.invalidPin);
      return;
    }
    const { action, id, client } = modalState.data;
    setPinInput("");
    setPinError("");
    if (action === "delete") {
      setModalState({ type: "delete", data: id });
    } else if (action === "edit") {
      setModalState({ type: "edit", data: { id, ...client } });
      setFormData({ ...client, day: client.day || "", month: client.month || "", year: client.year || "2025", typeClient: client.typeClient || "", dataCassa: client.dataCassa || "" });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    try {
      setIsProcessing(true);
      let updatedPrice = parseFloat(formData.price) || 0;
      if (formData.sale === "15%") updatedPrice *= 0.85;
      else if (formData.sale === "20%") updatedPrice *= 0.80;
      const updatedFormData = { ...formData, price: updatedPrice.toFixed(2) };
      await updateClient(modalState.data.id, updatedFormData);
      setClients(prev => prev.map(client => client.id === modalState.data.id ? { ...client, ...updatedFormData } : client));
      setModalState({ type: null, data: null });
    } catch (error) {
      alert(errorMessages.updateClientError);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenewal = async () => {
    try {
      setIsProcessing(true);
      const client = modalState.data;
      const periods = generateRenewalPeriods(client, parseInt(selectedMonths));
      const newClients = [];
      for (const period of periods) {
        const updatedClient = { ...client, month: period.month, year: period.year, day: period.day };
        await addClient(updatedClient);
        newClients.push(updatedClient);
      }
      setClients(prev => [...prev, ...newClients]);
      setModalState({ type: null, data: null });
    } catch (error) {
      alert(errorMessages.renewalError);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsProcessing(true);
      await deleteClient(modalState.data);
      setClients(prev => prev.filter(client => client.id !== modalState.data));
      setModalState({ type: null, data: null });
    } catch (error) {
      alert(errorMessages.deleteClientError);
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setModalState({ type: null, data: null });
    setPinInput("");
    setPinError("");
    setSelectedClient(null);
  };

  // Аналитика
  const analytics = useMemo(() => {
    const byType = typeClients.reduce((acc, type) => {
      acc[type] = clients.filter(client => client.typeClient === type).length;
      return acc;
    }, {});
    const bySport = sports.reduce((acc, sport) => {
      acc[sport] = clients.filter(client => client.sport_category === sport).length;
      return acc;
    }, {});
    const byTrainer = trainers.reduce((acc, trainer) => {
      acc[trainer] = clients.filter(client => client.trainer === trainer).length;
      return acc;
    }, {});
    const totalRevenue = clients.reduce((sum, client) => sum + (parseFloat(client.price) || 0), 0);
    const byMonth = months.reduce((acc, month) => {
      acc[month] = clients.filter(client => client.month === month).length;
      return acc;
    }, {});
    return { byType, bySport, byTrainer, totalRevenue, byMonth };
  }, [clients]);

  const fieldPairs = [
    [formFieldConfig.find(f => f.name === "name"), formFieldConfig.find(f => f.name === "phone")],
    [formFieldConfig.find(f => f.name === "sport_category"), formFieldConfig.find(f => f.name === "trainer")],
    [formFieldConfig.find(f => f.name === "email"), formFieldConfig.find(f => f.name === "year")],
    [formFieldConfig.find(f => f.name === "month"), formFieldConfig.find(f => f.name === "day")],
    [{ name: "dataCassa", type: "date", placeholder: "Дата оплаты", required: true }, formFieldConfig.find(f => f.name === "sale")],
    [formFieldConfig.find(f => f.name === "price"), formFieldConfig.find(f => f.name === "payment")],
    [formFieldConfig.find(f => f.name === "check_field"), { name: "typeClient", type: "select", placeholder: "Тип клиента", options: typeClients, required: true }],
    [formFieldConfig.find(f => f.name === "comment"), formFieldConfig.find(f => f.name === "stage")],
  ].filter(pair => pair[0] && pair[1]);

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-900 text-white">
      {/* Форма добавления клиента */}
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4">Добавить клиента</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fieldPairs.map((pair, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pair.map(field => (
                <div key={field.name}>
                  {field.type === "select" ? (
                    <SelectField
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      options={field.options}
                      placeholder={field.placeholder}
                      className={invalidFields.includes(field.name) ? "border-red-500" : ""}
                    />
                  ) : field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      className={`w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-teal-500 focus:bg-gray-700 transition ${invalidFields.includes(field.name) ? "border-red-500" : ""}`}
                      aria-label={field.placeholder}
                    />
                  ) : (
                    <InputField
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      type={field.type}
                      placeholder={field.placeholder}
                      readOnly={field.readOnly}
                      className={invalidFields.includes(field.name) ? "border-red-500" : ""}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
          <div className="col-span-1 md:col-span-2 flex items-center justify-between">
            <span className="text-teal-400">{formData.price ? `${calculateDiscountedPrice()} сом` : "Итог: не указана"}</span>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition ${loading ? "opacity-50 cursor-wait" : ""}`}
            >
              {loading ? "Добавление..." : "Добавить"}
            </button>
          </div>
        </form>
      </div>

      {/* Аналитика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <BarChart
          data={{
            labels: Object.keys(analytics.byType),
            values: Object.values(analytics.byType)
          }}
          title="Клиенты по типам"
        />
        <BarChart
          data={{
            labels: Object.keys(analytics.bySport),
            values: Object.values(analytics.bySport)
          }}
          title="Клиенты по видам спорта"
        />
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Общая выручка</h3>
          <p className="text-2xl text-teal-400">{analytics.totalRevenue.toFixed(2)} сом</p>
        </div>
      </div>

      {/* Фильтры и таблица */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Список клиентов</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <InputField name="name" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} placeholder="Фильтр по имени" />
          <SelectField name="trainer" value={filters.trainer} onChange={e => setFilters({ ...filters, trainer: e.target.value })} options={["", ...trainers]} placeholder="Фильтр по тренеру" />
          <SelectField name="sport_category" value={filters.sport_category} onChange={e => setFilters({ ...filters, sport_category: e.target.value })} options={["", ...sports]} placeholder="Фильтр по спорту" />
          <SelectField name="typeClient" value={filters.typeClient} onChange={e => setFilters({ ...filters, typeClient: e.target.value })} options={["", ...typeClients]} placeholder="Фильтр по типу" />
        </div>
        {loading ? (
          <div className="text-center">Загрузка...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="p-2">Имя</th>
                  <th className="p-2">Спорт</th>
                  <th className="p-2">Месяц</th>
                  <th className="p-2">Дата</th>
                  <th className="p-2">Оплата</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(client => (
                  <tr key={client.id} className={client.payment === "Не оплачено" ? "bg-red-900 bg-opacity-20" : ""}>
                    <td className="p-2">{client.name || "-"}</td>
                    <td className="p-2">{client.sport_category || "-"}</td>
                    <td className="p-2">{client.month || "-"}</td>
                    <td className="p-2">{client.dataCassa || "-"}</td>
                    <td className={`p-2 ${client.payment === "Не оплачено" ? "text-red-400" : "text-teal-400"}`}>{client.payment || "-"}</td>
                    <td className="p-2 flex gap-2">
                      <button className="text-teal-400 hover:underline" onClick={() => setSelectedClient(client)}>Подробности</button>
                      <button className="text-blue-400 hover:underline" onClick={() => handleAction("edit", client)}>Изменить</button>
                      <button className="text-green-400 hover:underline" onClick={() => handleAction("renewal", client)}>Продлить</button>
                      <button className="text-red-400 hover:underline" onClick={() => handleAction("delete", client)} disabled={isProcessing}>Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальные окна */}
      <Modal isOpen={selectedClient} onClose={closeModal} title="Детали клиента">
        {selectedClient && (
          <div className="space-y-2">
            <div><strong>Имя:</strong> {selectedClient.name || "-"}</div>
            <div><strong>Телефон:</strong> {selectedClient.phone || "-"}</div>
            <div><strong>Спорт:</strong> {selectedClient.sport_category || "-"}</div>
            <div><strong>Тренер:</strong> {selectedClient.trainer || "-"}</div>
            <div><strong>Время:</strong> {selectedClient.email || "-"}</div>
            <div><strong>Источник:</strong> {selectedClient.check_field || "-"}</div>
            <div><strong>Пол:</strong> {selectedClient.stage || "-"}</div>
            <div><strong>Дата:</strong> <DateFields formData={selectedClient} isEditing={false} /></div>
            <div><strong>Тип клиента:</strong> {selectedClient.typeClient || "-"}</div>
            <div><strong>Цена:</strong> {selectedClient.price ? `${selectedClient.price} сом` : "-"}</div>
            <div><strong>Скидка:</strong> {selectedClient.sale || "-"}</div>
            <div><strong>Оплата:</strong> <span className={selectedClient.payment === "Не оплачено" ? "text-red-400" : "text-teal-400"}>{selectedClient.payment || "-"}</span></div>
            <div><strong>Активные месяцы:</strong> {getClientActivePeriods.count > 0 ? `${getClientActivePeriods.count} мес.` : "-"}</div>
            <div><strong>Комментарий:</strong> {selectedClient.comment || "-"}</div>
          </div>
        )}
      </Modal>
      <Modal isOpen={modalState.type === "edit"} onClose={closeModal} title="Редактирование">
        <div className="space-y-4">
          <div><InputField name="name" value={formData.name} onChange={handleEditChange} placeholder="Имя" /></div>
          <div><InputField name="phone" value={formData.phone} onChange={handleEditChange} type="tel" placeholder="Телефон" /></div>
          <div><SelectField name="sport_category" value={formData.sport_category} onChange={handleEditChange} options={sports} placeholder="Спорт" /></div>
          <div><SelectField name="trainer" value={formData.trainer} onChange={handleEditChange} options={trainers} placeholder="Тренер" /></div>
          <div><SelectField name="email" value={formData.email} onChange={handleEditChange} options={timeSlots} placeholder="Время" /></div>
          <div><SelectField name="check_field" value={formData.check_field} onChange={handleEditChange} options={checkFieldOptions} placeholder="Источник" /></div>
          <div><SelectField name="stage" value={formData.stage} onChange={handleEditChange} options={["Мужской", "Женский"]} placeholder="Пол" /></div>
          <div><DateFields formData={formData} onChange={handleEditChange} isEditing={true} /></div>
          <div><SelectField name="typeClient" value={formData.typeClient} onChange={handleEditChange} options={typeClients} placeholder="Тип клиента" /></div>
          <div><InputField name="price" value={formData.price} onChange={handleEditChange} type="number" placeholder="Цена" /></div>
          <div><SelectField name="sale" value={formData.sale} onChange={handleEditChange} options={saleOptions} placeholder="Скидка" /></div>
          <div><SelectField name="payment" value={formData.payment} onChange={handleEditChange} options={paymentOptions.map(opt => opt.value)} placeholder="Оплата" /></div>
          <div><textarea name="comment" value={formData.comment || ""} onChange={handleEditChange} placeholder="Комментарий" className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-teal-500 focus:bg-gray-700 transition" /></div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition" onClick={handleEditSave} disabled={isProcessing}>Сохранить</button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition" onClick={closeModal}>Отмена</button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={modalState.type === "pin"} onClose={closeModal} title="PIN-код">
        <div className="space-y-4">
          <InputField type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} placeholder="PIN-код" />
          {pinError && <p className="text-red-400">{pinError}</p>}
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition" onClick={handlePinSubmit}>Подтвердить</button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition" onClick={closeModal}>Отмена</button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={modalState.type === "delete"} onClose={closeModal} title="Удаление">
        <p>Вы уверены, что хотите удалить клиента?</p>
        <div className="flex gap-2 mt-4">
          <button className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition" onClick={handleDeleteConfirm} disabled={isProcessing}>Да</button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition" onClick={closeModal} disabled={isProcessing}>Отмена</button>
        </div>
      </Modal>
      <Modal isOpen={modalState.type === "renewal"} onClose={closeModal} title="Продление">
        {modalState.data && (
          <div className="space-y-4">
            <div><strong>Имя:</strong> {modalState.data.name}</div>
            <div><strong>Месяц:</strong> {modalState.data.month || "-"}</div>
            <div><strong>Тип клиента:</strong> {modalState.data.typeClient || "-"}</div>
            <div><SelectField name="months" value={selectedMonths} onChange={e => setSelectedMonths(e.target.value)} options={renewalOptions} placeholder="Месяцы" /></div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition" onClick={handleRenewal} disabled={isProcessing}>Подтвердить</button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition" onClick={closeModal}>Отмена</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientManager;