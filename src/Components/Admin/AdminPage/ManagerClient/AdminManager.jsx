import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddClient from "./assets/AddClient";
import ClientsTable from "./assets/ClientsTable";
import ClientDelete from "./assets/ClientDelete";
import ClientUpdate from "./assets/ClientUpdate";
import ClientPayment from "./assets/ClientPayment";
import ExpiringClients from "./assets/ExpiringClients";
import DailyClients from "./assets/DailyClients";
import ClientStatus from "./assets/ClientStatus";

const AdminManager = () => {
  const [activeSection, setActiveSection] = useState("clients");
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const navigate = useNavigate();

  const getManagerName = () =>
    localStorage.getItem("manager_name") || "Unknown Manager";
  const managerName = getManagerName();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/admin");
  };

  const CORRECT_PIN = "4444";

  const handlePinSubmit = () => {
    if (pinInput === CORRECT_PIN) {
      setIsPinModalOpen(false);
      setPinInput("");
      setPinError("");
      setActiveSection("delete");
    } else {
      setPinError("Неверный PIN-код.");
    }
  };

  const handlePinCancel = () => {
    setIsPinModalOpen(false);
    setPinInput("");
    setPinError("");
  };

  const handleSectionChange = (section) => {
    if (section === "delete") {
      setIsPinModalOpen(true);
    } else {
      setActiveSection(section);
    }
  };

  const sections = {
    clients: <ClientsTable />,
    other: <AddClient />,
    update: <ClientUpdate />,
    payment: <ClientPayment />,
    dayclients: <DailyClients />,
    status: <ClientStatus />,
    delete: <ClientDelete />,
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <span className="manager-name">{`Пользователь: ${managerName}`}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </div>
      <div className="top-nav">
        <div
          className={`nav-item ${activeSection === "clients" ? "active" : ""}`}
          onClick={() => handleSectionChange("clients")}
        >
          Список
        </div>
        <div
          className={`nav-item ${activeSection === "other" ? "active" : ""}`}
          onClick={() => handleSectionChange("other")}
        >
          Добавление
        </div>
        <div
          className={`nav-item ${activeSection === "update" ? "active" : ""}`}
          onClick={() => handleSectionChange("update")}
        >
          Изменение
        </div>
        <div
          className={`nav-item ${activeSection === "payment" ? "active" : ""}`}
          onClick={() => handleSectionChange("payment")}
        >
          Продление
        </div>
        <div
          className={`nav-item ${activeSection === "dayclients" ? "active" : ""}`}
          onClick={() => handleSectionChange("dayclients")}
        >
          Дневной
        </div>
        <div
          className={`nav-item ${activeSection === "status" ? "active" : ""}`}
          onClick={() => handleSectionChange("status")}
        >
          Статус
        </div>
        <div
          className={`nav-item ${activeSection === "delete" ? "active" : ""}`}
          onClick={() => handleSectionChange("delete")}
        >
          Удаление
        </div>
      </div>
      <div className="main-content">{sections[activeSection]}</div>
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
};

export default AdminManager;