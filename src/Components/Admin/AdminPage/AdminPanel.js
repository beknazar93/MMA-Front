import React, { useState } from "react";
import AdminManager from "./ManagerClient/AdminManager";
import ProductTabs from "./Product/ProductTabs";
import Analitic from "./Analitic/Analitic";
import Register from "../Auth/Register";
import WhatsAppChat from "../AdminPage/Chat/WhatsAppQR";
import {
  FaBars,
  FaUsers,
  FaChartBar,
  FaBox,
  FaUserPlus,
  FaWhatsapp,
} from "react-icons/fa";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("ClientManager");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const tabs = [
    { name: "ClientManager", icon: <FaUsers /> },
    { name: "Analitic", icon: <FaChartBar /> },
    { name: "Products", icon: <FaBox /> },
    { name: "Register", icon: <FaUserPlus /> },
    { name: "WhatsApp", icon: <FaWhatsapp /> },
  ];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "ClientManager":
        return <AdminManager />;
      case "Analitic":
        return <Analitic />;
      case "Products":
        return <ProductTabs />;
      case "Register":
        return <Register />;
      case "WhatsApp":
        return <WhatsAppChat />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-panel">
      <div
        className={`custom-sidebar ${
          isSidebarCollapsed ? "custom-sidebar--collapsed" : ""
        }`}
      >
        <button className="toggle-sidebar" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <ul className="custom-sidebar__list">
          {tabs.map((tab) => (
            <li
              key={tab.name}
              className={`custom-sidebar__item ${
                activeTab === tab.name ? "custom-sidebar__item--active" : ""
              }`}
              onClick={() => setActiveTab(tab.name)}
            >
              {isSidebarCollapsed ? tab.icon : tab.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-panel__content">{renderContent()}</div>
    </div>
  );
};

export default AdminPanel;
