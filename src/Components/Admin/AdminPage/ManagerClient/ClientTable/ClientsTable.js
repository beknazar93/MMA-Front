import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchClients, deleteClient, updateClient, addClient } from "../../api/API";
import FilterComponent from "../ClientFilter/ClientFilter";
import { trainers, sports, months, years, days, checkFieldOptions, timeSlots, saleOptions, renewalOptions, CORRECT_PIN, paymentOptions, errorMessages } from "../../Constants/constants";
import './ClientsTable.scss';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="client-list__modal">
      <div className="client-list__modal-content">
        <button className="client-list__modal-close" onClick={onClose} aria-label="Закрыть">×</button>
        <h2 className="client-list__modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
};

const SelectField = ({ name, value, onChange, options, placeholder, disabled }) => (
  <select name={name} value={value || ""} onChange={onChange} className="client-list__modal-select" disabled={disabled}>
    <option value="" disabled>{placeholder}</option>
    {options.map(option => <option key={option} value={option}>{option}</option>)}
  </select>
);

const InputField = ({ name, value, onChange, type = "text", placeholder, disabled }) => (
  <input
    type={type}
    name={name}
    value={value || ""}
    onChange={onChange}
    placeholder={placeholder}
    className="client-list__modal-input"
    disabled={disabled}
    aria-label={placeholder}
  />
);

const DateFields = ({ formData, onChange, disabled, isEditing }) => (
  <div className="client-list__modal-date-group">
    {isEditing ? (
      <>
        <SelectField
          name="day"
          value={formData.day}
          onChange={onChange}
          options={days}
          placeholder="День"
          disabled={disabled}
        />
        <SelectField
          name="month"
          value={formData.month}
          onChange={onChange}
          options={months}
          placeholder="Месяц"
          disabled={disabled}
        />
        <SelectField
          name="year"
          value={formData.year}
          onChange={onChange}
          options={years}
          placeholder="Год"
          disabled={disabled}
        />
        <InputField
          name="dataCassa"
          value={formData.dataCassa}
          onChange={onChange}
          type="date"
          placeholder="Дата кассы"
          disabled={disabled}
        />
      </>
    ) : (
      <>
        <span>{formData.day || "-"} {formData.month || "-"} {formData.year || "-"}</span>
        <span>{formData.dataCassa || "-"}</span>
      </>
    )}
  </div>
);

const ClientsTable = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ name: "", trainer: "", sport_category: "", day: "", month: "", year: "", typeClient: "", payment: "" });
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [formData, setFormData] = useState({});
  const [isPriceEditable, setIsPriceEditable] = useState(false);
  const [isSaleEditable, setIsSaleEditable] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState("1");
  const [isProcessing, setIsProcessing] = useState(false);

  const typeClients = ['Обычный', 'Пробный', 'Индивидуальный', 'Абонемент'];

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const clientsData = await fetchClients();
      setClients(clientsData);
      setError(null);
    } catch (error) {
      setError(errorMessages.loadingError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

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
    const currentYearNum = client.year ? parseInt(client.year) : new Date().getFullYear();
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
        setModalState({ type: "edit", data: { id: client.id, ...client } });
        setFormData({ ...client, day: client.day || "", month: client.month || "", year: client.year || "", typeClient: client.typeClient || "", dataCassa: client.dataCassa || "" });
        setIsPriceEditable(false);
        setIsSaleEditable(false);
        break;
      case "delete":
        setModalState({ type: "pin", data: { action: "delete", id: client.id } });
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
    const { action, id } = modalState.data;
    setPinInput("");
    setPinError("");
    if (action === "delete") {
      setModalState({ type: "delete", data: id });
    } else if (action === "price") {
      setIsPriceEditable(true);
      setModalState({ type: "edit", data: modalState.data });
    } else if (action === "sale") {
      setIsSaleEditable(true);
      setModalState({ type: "edit", data: modalState.data });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" && !isPriceEditable) {
      setModalState({ type: "pin", data: { action: "price", id: modalState.data.id } });
      return;
    }
    if (name === "sale" && !isSaleEditable) {
      setModalState({ type: "pin", data: { action: "sale", id: modalState.data.id } });
      return;
    }
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
    setIsPriceEditable(false);
    setIsSaleEditable(false);
    setSelectedClient(null);
  };

  return (
    <div className="client-list">
      <FilterComponent filters={filters} setFilters={setFilters} />
      {loading ? (
        <div className="client-list__spinner" />
      ) : error ? (
        <p className="client-list__error">{error}</p>
      ) : (
        <div className="client-list__table-container">
          <table className="client-list__table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Спорт</th>
                <th>Месяц</th>
                <th>День</th>
                <th>Дата</th>
                <th>Оплата</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client.id} className={client.payment === "Не оплачено" ? "client-list__row--unpaid" : ""}>
                  <td>{client.name || "-"}</td>
                  <td>{client.sport_category || "-"}</td>
                  <td>{client.month || "-"}</td>
                  <td>{client.day || "-"}</td>
                  <td>{client.dataCassa || "-"}</td>
                  <td className={`client-list__payment client-list__payment--${client.payment}`}>{client.payment || "-"}</td>
                  <td>
                    <button className="client-list__details" onClick={() => setSelectedClient(client)}>Подробности</button>
                    <button className="client-list__action client-list__action--edit" onClick={() => handleAction("edit", client)}>Изменить</button>
                    <button className="client-list__action client-list__action--renew" onClick={() => handleAction("renewal", client)}>Продлить</button>
                    <button className="client-list__action client-list__action--delete" onClick={() => handleAction("delete", client)} disabled={isProcessing}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={selectedClient} onClose={closeModal} title="Детали клиента">
        {selectedClient && (
          <div className="client-list__modal-form">
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Имя:</span>
              <span>{selectedClient.name || "-"}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Телефон:</span>
              <span>{selectedClient.phone || "-"}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Спорт:</span>
              <span>{selectedClient.sport_category || "-"}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Тренер:</span>
              <span>{selectedClient.trainer || "-"}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Время:</span>
              <span>{selectedClient.email || "-"}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Источник:</span>
              <span>{selectedClient.check_field || "-"}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Пол:</span>
              <span>{selectedClient.stage || "-"}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Дата:</span>
              <DateFields formData={selectedClient} isEditing={false} />
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Тип клиента:</span>
              <span>{selectedClient.typeClient || "-"}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Цена:</span>
              <span>{selectedClient.price ? `${selectedClient.price} сом` : "-"}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Скидка:</span>
              <span>{selectedClient.sale || "-"}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Оплата:</span>
              <span className={`client-list__modal-payment client-list__modal-payment--${selectedClient.payment}`}>
                {selectedClient.payment || "-"}
              </span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Активные месяцы:</span>
              <span>{getClientActivePeriods.count > 0 ? (
                <>{getClientActivePeriods.count} мес. <select className="client-list__modal-select" defaultValue="">
                  <option value="" disabled>Период</option>
                  {getClientActivePeriods.periods.map((period, index) => <option key={index} value={period}>{period}</option>)}
                </select></>
              ) : "-"}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Комментарий:</span>
              <span>{selectedClient.comment || "-"}</span>
            </div>
          </div>
        )}
      </Modal>
      <Modal isOpen={modalState.type === "edit"} onClose={closeModal} title="Редактирование">
        <div className="client-list__modal-form">
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Имя:</span>
            <InputField name="name" value={formData.name} onChange={handleEditChange} placeholder="Имя" />
          </div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Телефон:</span>
            <InputField name="phone" value={formData.phone} onChange={handleEditChange} type="tel" placeholder="Телефон" />
          </div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Спорт:</span>
            <SelectField name="sport_category" value={formData.sport_category} onChange={handleEditChange} options={sports} placeholder="Спорт" />
          </div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Тренер:</span>
            <SelectField name="trainer" value={formData.trainer} onChange={handleEditChange} options={trainers} placeholder="Тренер" />
          </div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Время:</span>
            <SelectField name="email" value={formData.email} onChange={handleEditChange} options={timeSlots} placeholder="Время" />
          </div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Источник:</span>
            <SelectField name="check_field" value={formData.check_field} onChange={handleEditChange} options={checkFieldOptions} placeholder="Источник" />
          </div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Пол:</span>
            <SelectField name="stage" value={formData.stage} onChange={handleEditChange} options={["Мужской", "Женский"]} placeholder="Пол" />
          </div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Дата:</span>
            <DateFields formData={formData} onChange={handleEditChange} isEditing={true} />
          </div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Тип клиента:</span>
            <SelectField name="typeClient" value={formData.typeClient} onChange={handleEditChange} options={typeClients} placeholder="Тип клиента" />
          </div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Цена:</span>
            <div className="client-list__price-field">
              <InputField name="price" value={formData.price} onChange={handleEditChange} type="number" placeholder="Цена" disabled={!isPriceEditable} />
              {!isPriceEditable && (
                <svg
                  onClick={() => setModalState({ type: "pin", data: { action: "price", id: modalState.data.id } })}
                  className="client-list__unlock-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00cc99"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                </svg>
              )}
            </div>
          </div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Скидка:</span>
            <div className="client-list__sale-field">
              <SelectField name="sale" value={formData.sale} onChange={handleEditChange} options={saleOptions} placeholder="Скидка" disabled={!isSaleEditable} />
              {!isSaleEditable && (
                <svg
                  onClick={() => setModalState({ type: "pin", data: { action: "sale", id: modalState.data.id } })}
                  className="client-list__unlock-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00cc99"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                </svg>
              )}
            </div>
          </div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Оплата:</span>
            <SelectField name="payment" value={formData.payment} onChange={handleEditChange} options={paymentOptions.map(opt => opt.value)} placeholder="Оплата" />
          </div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Комментарий:</span>
            <textarea name="comment" value={formData.comment || ""} onChange={handleEditChange} placeholder="Комментарий" className="client-list__modal-textarea" />
          </div>
          <div className="client-list__modal-actions">
            <button className="client-list__modal-button client-list__modal-button--save" onClick={handleEditSave} disabled={isProcessing}>Сохранить</button>
            <button className="client-list__modal-button client-list__modal-button--cancel" onClick={closeModal}>Отмена</button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={modalState.type === "pin"} onClose={closeModal} title="PIN-код">
        <div className="client-list__modal-form">
          <InputField type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} placeholder="PIN-код" />
          {pinError && <p className="client-list__error">{pinError}</p>}
          <div className="client-list__modal-actions">
            <button className="client-list__modal-button client-list__modal-button--save" onClick={handlePinSubmit}>Подтвердить</button>
            <button className="client-list__modal-button client-list__modal-button--cancel" onClick={closeModal}>Отмена</button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={modalState.type === "delete"} onClose={closeModal} title="Удаление">
        <p className="client-list__modal-message">Вы уверены, что хотите удалить клиента?</p>
        <div className="client-list__modal-actions">
          <button className="client-list__modal-button client-list__modal-button--save" onClick={handleDeleteConfirm} disabled={isProcessing}>Да</button>
          <button className="client-list__modal-button client-list__modal-button--cancel" onClick={closeModal} disabled={isProcessing}>Отмена</button>
        </div>
      </Modal>
      <Modal isOpen={modalState.type === "renewal"} onClose={closeModal} title="Продление">
        {modalState.data && (
          <div className="client-list__modal-form">
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Имя:</span>
              <span>{modalState.data.name}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Месяц:</span>
              <span>{modalState.data.month || "-"}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Тип клиента:</span>
              <span>{modalState.data.typeClient || "-"}</span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Месяцы:</span>
              <SelectField name="months" value={selectedMonths} onChange={e => setSelectedMonths(e.target.value)} options={renewalOptions} placeholder="Месяцы" />
            </div>
            <div className="client-list__modal-actions">
              <button className="client-list__modal-button client-list__modal-button--save" onClick={handleRenewal} disabled={isProcessing}>Подтвердить</button>
              <button className="client-list__modal-button client-list__modal-button--cancel" onClick={closeModal}>Отмена</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientsTable;