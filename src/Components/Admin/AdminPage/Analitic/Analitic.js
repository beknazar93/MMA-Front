import React, { useState } from "react";
import Sport from "./Sport/Sport";
import Dashboard from "./Dashboard/Dashboard";
import './Analitic.scss';
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import ClientIncomeByDays from "./ClientIncomeByDays/ClientIncomeByDays";
import Trainers from "./Trainers/Trainers";
import ProductAnalytics from "./ProductAnalytics/ProductAnalytics";
import ClientAnalytics from "./ClientAnalytics/ClientAnalytics";
import ClientIncomeByDate from "./ClientIncomeByDate/ClientIncomeByDate";

function Analitic() {
  const [activeTab, setActiveTab] = useState("Dashboard");

    const navigate = useNavigate();
    const managerName = localStorage.getItem("manager_name") || "Unknown Manager";
  
    const handleLogout = () => {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      navigate("/admin");
    };

  const tabs = [
    { name: "Dashboard", label: "Клиенты", icon: "⚥", component: <Dashboard /> },
    // { name: "ClientIncome", label: "Общий доход", icon: "💸", component: <ClientIncome /> },
    // { name: "Sport", label: "Доход по спорту", icon: "🏀", component: <Sport /> },
    // { name: "TrainerAnalytics", label: "Доход по дате", icon: "👥", component: <ClientIncomeByDate /> },
    { name: "Trainers", label: "Тренеры", icon: "👥", component: <Trainers /> },
    { name: "ClientIncomeByDays", label: "Зарплата", icon: "💸", component: <ClientIncomeByDays /> },
    { name: "Product", label: "Продукт", icon: "👥", component: <ProductAnalytics /> },
    { name: "Client", label: "Клиент", icon: "👥", component: <ClientAnalytics /> },
  ];

  const renderContent = () => {
    const activeTabConfig = tabs.find((tab) => tab.name === activeTab);
    return activeTabConfig ? activeTabConfig.component : null;
  };

  return (
    <div className="analitic">
            <div className="admin-manager__header">
              <span className="admin-manager__manager-name">{managerName}</span>
              <button className="admin-manager__logout-btn" onClick={handleLogout} aria-label="Выйти">
                <FaSignOutAlt />
              </button>
            </div>
      <div className="analitic__header">
        <h1 className="analitic__title"></h1>
        <div className="analitic__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`analitic__tab ${activeTab === tab.name ? "analitic__tab--active" : ""}`}
              onClick={() => setActiveTab(tab.name)}
            >
              <span className="analitic__tab-icon">{tab.icon}</span>
              <span className="analitic__tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      {renderContent()}
    </div>
  );
}

export default Analitic;