// import React, { useState, useMemo, useEffect } from "react";
// import AdminManager from "./ManagerClient/AdminManager";
// import ProductTabs from "./Product/ProductTabs/ProductTabs";
// import Analitic from "./Analitic/Analitic";
// import Register from "../Auth/Register";
// import Notes from "./Notes/Notes";
// import {
//   FaUsers,
//   FaChartBar,
//   FaBox,
//   FaUserPlus,
//   FaNotesMedical,
//   FaAngleLeft,
//   FaAngleRight,
// } from "react-icons/fa";
// import Logo from "../../mma.png";
// import "./AdminPanel.scss";
// import Users from "./Users/Users";

// const AdminPanel = () => {
//   const [activeTab, setActiveTab] = useState("ClientManager");
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   const userRole = localStorage.getItem("role") || "client_manager";

//   const toggleSidebar = () => {
//     setIsSidebarCollapsed(!isSidebarCollapsed);
//   };

//   const allTabs = useMemo(
//     () => [
//       {
//         name: "ClientManager",
//         icon: <FaUsers />,
//         label: "Клиенты",
//         roles: ["admin", "client_manager"],
//       },
//       {
//         name: "Products",
//         icon: <FaBox />,
//         label: "Продукты",
//         roles: ["admin", "product_manager", "client_manager"],
//       },
//       {
//         name: "Notes",
//         icon: <FaNotesMedical />,
//         label: "Заметки",
//         roles: ["admin", "client_manager", "product_manager"],
//       },
//       {
//         name: "Analitic",
//         icon: <FaChartBar />,
//         label: "Аналитика",
//         roles: ["admin"],
//       },
//             {
//         name: "Users",
//         icon: <FaChartBar />,
//         label: "Сотрулники",
//         roles: ["admin"],
//       },
//       {
//         name: "Register",
//         icon: <FaUserPlus />,
//         label: "Регистрация",
//         roles: ["admin"],
//       },
//     ],
//     []
//   );

//   const tabs = useMemo(
//     () => allTabs.filter((tab) => tab.roles.includes(userRole)),
//     [userRole]
//   );

//   useEffect(() => {
//     if (!tabs.some((tab) => tab.name === activeTab)) {
//       setActiveTab(tabs[0]?.name || "ClientManager");
//     }
//   }, [activeTab, tabs]);

//   const renderContent = () => {
//     if (!tabs.some((tab) => tab.name === activeTab)) {
//       return <div className="admin-panel__access-denied">Доступ запрещен</div>;
//     }

//     switch (activeTab) {
//       case "ClientManager":
//         return <AdminManager />;
//       case "Products":
//         return <ProductTabs />;
//       case "Notes":
//         return <Notes />;
//       case "Analitic":
//         return <Analitic />;
//               case "Users":
//         return <Users />;
//       case "Register":
//         return <Register />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="admin-panel">
//       <div
//         className={`admin-panel__sidebar ${
//           isSidebarCollapsed ? "admin-panel__sidebar--collapsed" : ""
//         }`}
//       >
//         <div className="admin-panel__sidebar-logo">
//           <div className="admin-panel__sidebar-logo-circle">
//             <img
//               src={Logo}
//               alt="MMA Logo"
//               className="admin-panel__sidebar-logo-image"
//             />
//           </div>
//         </div>
//         <button
//           className="admin-panel__sidebar-toggle"
//           onClick={toggleSidebar}
//           aria-label="Переключить сайдбар"
//         >
//           {isSidebarCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
//         </button>
//         <ul className="admin-panel__sidebar-list">
//           {tabs.map((tab) => (
//             <li
//               key={tab.name}
//               className={`admin-panel__sidebar-item ${
//                 activeTab === tab.name
//                   ? "admin-panel__sidebar-item--active"
//                   : ""
//               }`}
//               onClick={() => setActiveTab(tab.name)}
//               title={isSidebarCollapsed ? tab.label : ""}
//             >
//               <span className="admin-panel__sidebar-item-icon">{tab.icon}</span>
//               {!isSidebarCollapsed && (
//                 <span className="admin-panel__sidebar-item-label">
//                   {tab.label}
//                 </span>
//               )}
//             </li>
//           ))}
//         </ul>
//       </div>
//       <div className="admin-panel__content">{renderContent()}</div>
//     </div>
//   );
// };

// export default AdminPanel;



import React, { useState, useMemo, useEffect } from "react";
import AdminManager from "./ManagerClient/AdminManager";
import ProductTabs from "./Product/ProductTabs/ProductTabs";
import Analitic from "./Analitic/Analitic";
import Register from "../Auth/Register";
import Notes from "./Notes/Notes";
import Users from "./Users/Users";
import {
  FaUsers,
  FaBoxOpen, // Более выразительная иконка для продуктов
  FaStickyNote, // Замена FaNotesMedical на более подходящую
  FaChartLine, // Замена FaChartBar для аналитики
  FaUserCog, // Новая иконка для сотрудников
  FaUserPlus,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";
import Logo from "../../mma.png";
import "./AdminPanel.scss";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("ClientManager");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const userRole = localStorage.getItem("role") || "client_manager";

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const allTabs = useMemo(
    () => [
      {
        name: "ClientManager",
        icon: <FaUsers />,
        label: "Клиенты",
        roles: ["admin", "client_manager"],
      },
      {
        name: "Products",
        icon: <FaBoxOpen />, // Обновлено
        label: "Продукты",
        roles: ["admin", "product_manager", "client_manager"],
      },
      {
        name: "Notes",
        icon: <FaStickyNote />, // Обновлено
        label: "Заметки",
        roles: ["admin", "client_manager", "product_manager"],
      },
      {
        name: "Analitic",
        icon: <FaChartLine />, // Обновлено
        label: "Аналитика",
        roles: ["admin"],
      },
      {
        name: "Users",
        icon: <FaUserCog />, // Обновлено
        label: "Сотрудники",
        roles: ["admin"],
      },
      {
        name: "Register",
        icon: <FaUserPlus />,
        label: "Регистрация",
        roles: ["admin"],
      },
    ],
    []
  );

  const tabs = useMemo(
    () => allTabs.filter((tab) => tab.roles.includes(userRole)),
    [userRole]
  );

  useEffect(() => {
    if (!tabs.some((tab) => tab.name === activeTab)) {
      setActiveTab(tabs[0]?.name || "ClientManager");
    }
  }, [activeTab, tabs]);

  const renderContent = () => {
    if (!tabs.some((tab) => tab.name === activeTab)) {
      return <div className="admin-panel__access-denied">Доступ запрещен</div>;
    }

    switch (activeTab) {
      case "ClientManager":
        return <AdminManager />;
      case "Products":
        return <ProductTabs />;
      case "Notes":
        return <Notes />;
      case "Analitic":
        return <Analitic />;
      case "Users":
        return <Users />;
      case "Register":
        return <Register />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-panel">
      <div
        className={`admin-panel__sidebar ${
          isSidebarCollapsed ? "admin-panel__sidebar--collapsed" : ""
        }`}
      >
        <div className="admin-panel__sidebar-logo">
          <div className="admin-panel__sidebar-logo-circle">
            <img
              src={Logo}
              alt="MMA Logo"
              className="admin-panel__sidebar-logo-image"
            />
          </div>
        </div>
        <button
          className="admin-panel__sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Переключить сайдбар"
        >
          {isSidebarCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
        </button>
        <ul className="admin-panel__sidebar-list">
          {tabs.map((tab) => (
            <li
              key={tab.name}
              className={`admin-panel__sidebar-item ${
                activeTab === tab.name
                  ? "admin-panel__sidebar-item--active"
                  : ""
              }`}
              onClick={() => setActiveTab(tab.name)}
              title={isSidebarCollapsed ? tab.label : ""}
            >
              <span className="admin-panel__sidebar-item-icon">{tab.icon}</span>
              {!isSidebarCollapsed && (
                <span className="admin-panel__sidebar-item-label">
                  {tab.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="admin-panel__content">{renderContent()}</div>
    </div>
  );
};

export default AdminPanel;