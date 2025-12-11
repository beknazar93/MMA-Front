// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   FaUsers,
//   FaBoxOpen,
//   FaStickyNote,
//   FaChartBar,
//   FaUserTie,
//   FaUserPlus,
//   FaWhatsapp,
//   FaSignOutAlt,
// } from "react-icons/fa";
// import { MdLeaderboard } from "react-icons/md";
// import { FiX, FiChevronRight } from "react-icons/fi";
// import "./Sidebar.scss";

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();

//   const [collapsed, setCollapsed] = useState(false);

//   const managerName = localStorage.getItem("manager_name") || "Админ";
//   const avatarLetter = managerName.trim().charAt(0).toUpperCase() || "A";

//   const handleLogout = () => {
//     try {
//       localStorage.removeItem("access");
//       localStorage.removeItem("refresh");
//       localStorage.removeItem("manager_name");
//       localStorage.removeItem("role");
//       localStorage.removeItem("token");
//       localStorage.removeItem("auth_token");
//       navigate("/", { replace: true });
//     } catch (err) {
//       console.error("Ошибка выхода:", err);
//     }
//   };

//   const go = (to) => () => navigate(to);

//   const isActive = (route) =>
//     pathname === route || pathname.startsWith(route + "/");

//   return (
//     <aside className={`sidebar${collapsed ? " sidebar--collapsed" : ""}`}>
//       <div className="sidebar__top">
//         {/* ШАПКА С ЛОГО И КНОПКОЙ Х/ОТКРЫТЬ */}
//         <div className="sidebar__header">

//           <button
//             type="button"
//             className="sidebar__toggle"
//             onClick={() => setCollapsed((v) => !v)}
//           >
//             {collapsed ? <FiChevronRight /> : <FiX />}
//           </button>
//         </div>

//         <nav className="sidebar__nav">
//           <button
//             type="button"
//             className={`sidebar__link${
//               isActive("/crm/clients") || pathname === "/crm"
//                 ? " sidebar__link--active"
//                 : ""
//             }`}
//             onClick={go("/crm/clients")}
//           >
//             <FaUsers className="sidebar__icon" />
//             <span className="sidebar__label">Клиенты</span>
//           </button>

//           <button
//             type="button"
//             className={`sidebar__link${
//               isActive("/crm/goods") ? " sidebar__link--active" : ""
//             }`}
//             onClick={go("/crm/goods")}
//           >
//             <FaBoxOpen className="sidebar__icon" />
//             <span className="sidebar__label">Товары</span>
//           </button>

//           <button
//             type="button"
//             className={`sidebar__link${
//               isActive("/crm/notes") ? " sidebar__link--active" : ""
//             }`}
//             onClick={go("/crm/notes")}
//           >
//             <FaStickyNote className="sidebar__icon" />
//             <span className="sidebar__label">Заметки</span>
//           </button>

//           <button
//             type="button"
//             className={`sidebar__link${
//               isActive("/crm/analytics") ? " sidebar__link--active" : ""
//             }`}
//             onClick={go("/crm/analytics")}
//           >
//             <FaChartBar className="sidebar__icon" />
//             <span className="sidebar__label">Аналитика</span>
//           </button>

//           <button
//             type="button"
//             className={`sidebar__link${
//               isActive("/crm/staff") ? " sidebar__link--active" : ""
//             }`}
//             onClick={go("/crm/staff")}
//           >
//             <FaUserTie className="sidebar__icon" />
//             <span className="sidebar__label">Сотрудники</span>
//           </button>

//           <button
//             type="button"
//             className={`sidebar__link${
//               isActive("/crm/register") ? " sidebar__link--active" : ""
//             }`}
//             onClick={go("/crm/register")}
//           >
//             <FaUserPlus className="sidebar__icon" />
//             <span className="sidebar__label">Регистрация</span>
//           </button>

//           <button
//             type="button"
//             className={`sidebar__link${
//               isActive("/crm/whatsapp") ? " sidebar__link--active" : ""
//             }`}
//             onClick={go("/crm/whatsapp")}
//           >
//             <FaWhatsapp className="sidebar__icon" />
//             <span className="sidebar__label">Ватсап</span>
//           </button>

//           <button
//             type="button"
//             className={`sidebar__link${
//               isActive("/crm/leadstabs") ? " sidebar__link--active" : ""
//             }`}
//             onClick={go("/crm/leadstabs")}
//           >
//             <MdLeaderboard className="sidebar__icon" />
//             <span className="sidebar__label">Этапы лидов</span>
//           </button>
//         </nav>
//       </div>

//       <div className="sidebar__bottom">
//         <div className="sidebar__user">
//           <div className="sidebar__avatar">{avatarLetter}</div>
//           <span className="sidebar__name">{managerName}</span>
//         </div>

//         <button
//           type="button"
//           className="sidebar__logout"
//           onClick={handleLogout}
//         >
//           <FaSignOutAlt className="sidebar__logoutIcon" />
//           <span className="sidebar__label">Выйти</span>
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;




import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUsers,
  FaBoxOpen,
  FaStickyNote,
  FaChartBar,
  FaUserTie,
  FaUserPlus,
  FaWhatsapp,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdLeaderboard } from "react-icons/md";
import { FiX, FiChevronRight } from "react-icons/fi";
import "./Sidebar.scss";

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  const managerName = localStorage.getItem("manager_name") || "Админ";
  const avatarLetter = managerName.trim().charAt(0).toUpperCase() || "A";

  const userRole = localStorage.getItem("role") || "client_manager";

  const handleLogout = () => {
    try {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("manager_name");
      localStorage.removeItem("role");
      localStorage.removeItem("token");
      localStorage.removeItem("auth_token");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Ошибка выхода:", err);
    }
  };

  const go = (to) => () => navigate(to);

  const isActive = (route) =>
    pathname === route || pathname.startsWith(route + "/");

  // ВСЕ возможные пункты меню + роли, которым они доступны
  const allLinks = useMemo(
    () => [
      {
        route: "/crm/clients",
        icon: <FaUsers className="sidebar__icon" />,
        label: "Клиенты",
        roles: ["admin", "client_manager", "product_manager"],
      },
      {
        route: "/crm/goods",
        icon: <FaBoxOpen className="sidebar__icon" />,
        label: "Товары",
        roles: ["admin", "client_manager", "product_manager"],
      },
      {
        route: "/crm/notes",
        icon: <FaStickyNote className="sidebar__icon" />,
        label: "Заметки",
        roles: ["admin", "client_manager", "product_manager"],
      },
      {
        route: "/crm/analytics",
        icon: <FaChartBar className="sidebar__icon" />,
        label: "Аналитика",
        roles: ["admin"], // как Analitic в AdminPanel
      },
      {
        route: "/crm/staff",
        icon: <FaUserTie className="sidebar__icon" />,
        label: "Сотрудники",
        roles: ["admin"], // как Users в AdminPanel
      },
      {
        route: "/crm/register",
        icon: <FaUserPlus className="sidebar__icon" />,
        label: "Регистрация",
        roles: ["admin"], // как Register в AdminPanel
      },
      {
        route: "/crm/whatsapp",
        icon: <FaWhatsapp className="sidebar__icon" />,
        label: "Ватсап",
        roles: ["admin"],
      },
      {
        route: "/crm/leadstabs",
        icon: <MdLeaderboard className="sidebar__icon" />,
        label: "Этапы лидов",
        roles: ["admin"],
      },
    ],
    []
  );

  // Фильтрация пунктов по роли пользователя
  const links = useMemo(
    () => allLinks.filter((link) => link.roles.includes(userRole)),
    [allLinks, userRole]
  );

  return (
    <aside className={`sidebar${collapsed ? " sidebar--collapsed" : ""}`}>
      <div className="sidebar__top">
        {/* ШАПКА С КНОПКОЙ СВЕРНУТЬ/РАЗВЕРНУТЬ */}
        <div className="sidebar__header">
          <button
            type="button"
            className="sidebar__toggle"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <FiChevronRight /> : <FiX />}
          </button>
        </div>

        <nav className="sidebar__nav">
          {links.map((link) => (
            <button
              key={link.route}
              type="button"
              className={`sidebar__link${
                isActive(link.route) ? " sidebar__link--active" : ""
              }`}
              onClick={go(link.route)}
            >
              {link.icon}
              <span className="sidebar__label">{link.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar__bottom">
        <div className="sidebar__user">
          <div className="sidebar__avatar">{avatarLetter}</div>
          <span className="sidebar__name">{managerName}</span>
        </div>

        <button
          type="button"
          className="sidebar__logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="sidebar__logoutIcon" />
          <span className="sidebar__label">Выйти</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
