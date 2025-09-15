import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUsers, FaCalendarAlt, FaMoneyBillWave, FaBoxOpen, FaUserPlus } from "react-icons/fa";

import Dashboard from "./Dashboard/Dashboard";
import ClientIncomeByDays from "./ClientIncomeByDays/ClientIncomeByDays";
import ProductAnalytics from "./ProductAnalytics/ProductAnalytics";
import ClientIncomeByDate from "./ClientIncomeByDate/ClientIncomeByDate";
import NewClients from "./NewClients/NewClients";

import "./Analitic.scss";

function Analitic() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const navigate = useNavigate();
  const managerName = localStorage.getItem("manager_name") || "Unknown Manager";

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/admin");
  };

  // ✅ иконки из react-icons вместо эмодзи
  const tabs = [
    { name: "Dashboard",          label: "Клиенты",        Icon: FaUsers,          component: <Dashboard /> },
    { name: "TrainerAnalytics",   label: "Доход по дате",  Icon: FaCalendarAlt,    component: <ClientIncomeByDate /> },
    { name: "ClientIncomeByDays", label: "Зарплата",       Icon: FaMoneyBillWave,  component: <ClientIncomeByDays /> },
    { name: "Product",            label: "Продукт",        Icon: FaBoxOpen,        component: <ProductAnalytics /> },
    { name: "NewClient",          label: "Новые Клиенты",  Icon: FaUserPlus,       component: <NewClients /> },
  ];

  const renderContent = () => {
    const t = tabs.find((tab) => tab.name === activeTab);
    return t ? t.component : null;
  };

  return (
    <div className="analitic">
      <div className="admin-manager__header">
        <span className="admin-manager__manager-name">{managerName}</span>
        <button
          className="admin-manager__logout-btn"
          onClick={handleLogout}
          aria-label="Выйти"
          type="button"
        >
          <FaSignOutAlt />
        </button>
      </div>

      <div className="analitic__header">
        <h1 className="analitic__title"></h1>
        <div className="analitic__tabs" role="tablist" aria-label="Аналитика">
          {tabs.map(({ name, label, Icon }) => (
            <button
              key={name}
              type="button"
              role="tab"
              title={label}
              aria-selected={activeTab === name}
              aria-pressed={activeTab === name}
              className={`analitic__tab ${activeTab === name ? "analitic__tab--active" : ""}`}
              onClick={() => setActiveTab(name)}
            >
              <span className="analitic__tab-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="analitic__tab-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {renderContent()}
    </div>
  );
}

export default Analitic;
