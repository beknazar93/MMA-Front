import React, { useState } from "react";
import Photo from "../Header/img/mlogo.png";
import { Link } from "react-router-dom";
import { CiMenuKebab } from "react-icons/ci";
import "./Header.scss";

function Header() {
  const [isOpen, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <div className="header__nav">
          <Link to="/" className="header__logo-link">
            <img className="header__nav-logo" src={Photo} alt="Логотип" />
          </Link>

          <button
            className="header__nav-button"
            onClick={() => setOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <CiMenuKebab size={30} />
          </button>

          <nav className={`header__nav-menu ${isOpen ? "active" : ""}`}>
            <ul className="header__nav-list">
              <li className="header__nav-item">
                <Link
                  to="/"
                  className="header__nav-link"
                  onClick={() => setOpen(false)}
                >
                  Главная
                </Link>
              </li>
              <li className="header__nav-item">
                <Link
                  to="/sports"
                  className="header__nav-link"
                  onClick={() => setOpen(false)}
                >
                  Виды спорта
                </Link>
              </li>
              <li className="header__nav-item">
                <Link
                  to="/news"
                  className="header__nav-link"
                  onClick={() => setOpen(false)}
                >
                  Наш зал
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;