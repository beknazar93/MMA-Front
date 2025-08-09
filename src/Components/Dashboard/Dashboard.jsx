import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import styles from "./Dashboard.module.scss";

const Dashboard = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || { role: "realtor" };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={styles.dashboard}>
      <button
        className={`${styles.dashboard__toggle} ${
          isSidebarOpen ? styles.open : ""
        }`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      {isSidebarOpen && (
        <div
          className={`${styles.dashboard__overlay} ${
            isSidebarOpen ? styles.open : ""
          }`}
          onClick={closeSidebar}
        ></div>
      )}
      <aside
        className={`${styles.dashboard__sidebar} ${
          isSidebarOpen ? styles.open : ""
        }`}
      >
        <button
          className={styles.dashboard__close}
          onClick={closeSidebar}
          aria-label="Close sidebar"
        ></button>
        <nav className={styles.dashboard__nav}>
          <NavLink
            to="profile"
            className={({ isActive }) =>
              `${styles.dashboard__nav_link} ${
                isActive ? styles["dashboard__nav_link--active"] : ""
              }`
            }
            title="Мой профиль"
            onClick={closeSidebar}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Мой профиль
          </NavLink>
          <NavLink
            to="my-listings"
            className={({ isActive }) =>
              `${styles.dashboard__nav_link} ${
                isActive ? styles["dashboard__nav_link--active"] : ""
              }`
            }
            title="Мои объявления"
            onClick={closeSidebar}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Мои объявления
          </NavLink>
          <NavLink
            to="listing-manager"
            className={({ isActive }) =>
              `${styles.dashboard__nav_link} ${
                isActive ? styles["dashboard__nav_link--active"] : ""
              }`
            }
            title="Объявления"
            onClick={closeSidebar}
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2h-4V9h-2v6h2v-2h4zm-4-4v2h4v2h4v2h-4v2h-2V9h2z" />
            </svg>
            Объявления
          </NavLink>
          <NavLink
            to="create-listing"
            className={({ isActive }) =>
              `${styles.dashboard__nav_link} ${
                isActive ? styles["dashboard__nav_link--active"] : ""
              }`
            }
            title="Новое объявление"
            onClick={closeSidebar}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Новое объявление
          </NavLink>
          <NavLink
            to="bit"
            className={({ isActive }) =>
              `${styles.dashboard__nav_link} ${
                isActive ? styles["dashboard__nav_link--active"] : ""
              }`
            }
            title="Заявки"
            onClick={closeSidebar}
          >
            <svg viewBox="0 0 24 24">
              <path d="M4 4h16v2H4zm0 4h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8zm4 4H6v2h2v-2z" />
            </svg>
            Заявки
          </NavLink>
          {user.role === "admin" && (
            <>
              <NavLink
                to="locations"
                className={({ isActive }) =>
                  `${styles.dashboard__nav_link} ${
                    isActive ? styles["dashboard__nav_link--active"] : ""
                  }`
                }
                title="Локация"
                onClick={closeSidebar}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Локация
              </NavLink>
              <NavLink
                to="texteditor"
                className={({ isActive }) =>
                  `${styles.dashboard__nav_link} ${
                    isActive ? styles["dashboard__nav_link--active"] : ""
                  }`
                }
                title="О нас"
                onClick={closeSidebar}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-9 14l-5-5 5-5 5 5-5 5z" />
                </svg>
                О нас
              </NavLink>
              <NavLink
                to="image-admin"
                className={({ isActive }) =>
                  `${styles.dashboard__nav_link} ${
                    isActive ? styles["dashboard__nav_link--active"] : ""
                  }`
                }
                title="Изображения"
                onClick={closeSidebar}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-9 14l-5-5 5-5 5 5-5 5z" />
                </svg>
                Изображения
              </NavLink>
              <NavLink
                to="employee"
                className={({ isActive }) =>
                  `${styles.dashboard__nav_link} ${
                    isActive ? styles["dashboard__nav_link--active"] : ""
                  }`
                }
                title="Сотрудники"
                onClick={closeSidebar}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7c-3.31 0-10 1.69-10 5v2h20v-2c0-3.31-6.69-5-10-5z" />
                </svg>
                Сотрудники
              </NavLink>
              <NavLink
                to="single"
                className={({ isActive }) =>
                  `${styles.dashboard__nav_link} ${
                    isActive ? styles["dashboard__nav_link--active"] : ""
                  }`
                }
                title="Комплекс"
                onClick={closeSidebar}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-1 2v10H6V5h12zm-2 12H8v2h8v-2z" />
                </svg>
                Комплекс
              </NavLink>
              <NavLink
                to="register"
                className={({ isActive }) =>
                  `${styles.dashboard__nav_link} ${
                    isActive ? styles["dashboard__nav_link--active"] : ""
                  }`
                }
                title="Регистрация"
                onClick={closeSidebar}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M18 8h1a4 4 0 010 8h-1m-6 0H6a4 4 0 010-8h1m7-3H6a4 4 0 00-4 4v8a4 4 0 004 4h6" />
                </svg>
                Регистрация
              </NavLink>
            </>
          )}
          <button
            onClick={() => {
              onLogout();
              closeSidebar();
            }}
            className={styles.dashboard__logout}
            title="Выход"
          >
            <svg viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m6 18l6-6-6-6m6 6H9" />
            </svg>
            Выход
          </button>
        </nav>
      </aside>
      <main className={styles.dashboard__content}>
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;