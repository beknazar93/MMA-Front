import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaHeart, FaPhone, FaSignInAlt } from 'react-icons/fa';
import styles from './Header.module.scss';
import logo from '../../img/logo.JPG';

const messages = {
  ru: {
    home: 'Главная',
    about: 'О нас',
    favorites: 'Избранное',
    contacts: 'Контакты',
    login: 'Логин',
    settings: 'Настройки',
    language: 'Язык',
    city: 'Город',
    save: 'Сохранить',
    selectLanguage: 'Выбрать язык',
    selectCity: 'Выбрать город',
    logoAlt: 'Darek Logo',
    languageRussian: 'Русский',
    languageKyrgyz: 'Кыргызский',
    cityBishkek: 'Бишкек',
    cityOsh: 'Ош',
    cityPlaceholder: 'Город',
    settingsButton: '{language} / {city}',
    closeSettings: 'Закрыть настройки',
  },
  ky: {
    home: 'Башкы бет',
    about: 'Биз жөнүндө',
    favorites: 'Тандалмалар',
    contacts: 'Байланыштар',
    login: 'Кирүү',
    settings: 'Жөндөөлөр',
    language: 'Тил',
    city: 'Шаар',
    save: 'Сактоо',
    selectLanguage: 'Тил тандаңыз',
    selectCity: 'Шаар тандаңыз',
    logoAlt: 'Darek Logo',
    languageRussian: 'Орусча',
    languageKyrgyz: 'Кыргызча',
    cityBishkek: 'Бишкек',
    cityOsh: 'Ош',
    cityPlaceholder: 'Шаар',
    settingsButton: '{language} / {city}',
    closeSettings: 'Жөндөөлөрдү жабуу',
  },
};

const Header = ({ onCityChange, onLanguageChange, language = 'ru', city = '' }) => {
  const [tempCity, setTempCity] = useState(city);
  const [tempLanguage, setTempLanguage] = useState(language);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);

  const handleLanguageChange = (e) => {
    setTempLanguage(e.target.value);
  };

  const handleCityChange = (e) => {
    setTempCity(e.target.value);
  };

  const handleSave = () => {
    onLanguageChange(tempLanguage);
    onCityChange(tempCity);
    console.log('Сохранено:', { language: tempLanguage, city: tempCity });
    setIsSettingsOpen(false);
  };

  const handleCloseSettings = () => {
    setTempLanguage(language);
    setTempCity(city);
    setIsSettingsOpen(false);
  };

  const handleScroll = (sectionId) => {
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        window.scrollTo({
          top: element.offsetTop - 80,
          behavior: 'smooth',
        });
      }
    }
    closeMobileMenu();
  };

  const getNavLinkClass = ({ isActive }, sectionId) => {
    const isHomeActive = location.pathname === '/' && sectionId === 'home' && !location.hash;
    const isSectionActive = location.pathname === '/' && location.hash === `#${sectionId}`;
    return `${styles['header__nav-link']} ${
      isActive || isHomeActive || isSectionActive ? styles['header__nav-link--active'] : ''
    }`;
  };

  const t = (key, values = {}) => {
    let text = messages[language][key] || messages.ru[key] || '';
    Object.keys(values).forEach((k) => {
      text = text.replace(`{${k}}`, values[k]);
    });
    return text;
  };

  return (
    <header className={styles.header}>
      <div className={styles.header__container}>
        <NavLink to="/" className={styles.header__logo}>
          <img src={logo} alt={t('logoAlt')} className={styles['header__logo-img']} />
          <span className={styles['header__logo-text']}></span>
        </NavLink>
        <nav className={styles.header__nav}>
          <NavLink
            to="/"
            className={(props) => getNavLinkClass(props, 'home')}
            onClick={() => handleScroll('home')}
          >
            <FaHome className={styles['header__nav-icon']} />
            {t('home')}
          </NavLink>
          <NavLink
            to="/#about"
            className={(props) => getNavLinkClass(props, 'about')}
            onClick={() => handleScroll('about')}
          >
            <FaInfoCircle className={styles['header__nav-icon']} />
            {t('about')}
          </NavLink>
          <NavLink
            to="/favorites"
            className={(props) => getNavLinkClass(props, 'favorites')}
          >
            <FaHeart className={styles['header__nav-icon']} />
            {t('favorites')}
          </NavLink>
          <NavLink
            to="/#contacts"
            className={(props) => getNavLinkClass(props, 'contacts')}
            onClick={() => handleScroll('contacts')}
          >
            <FaPhone className={styles['header__nav-icon']} />
            {t('contacts')}
          </NavLink>
        </nav>
        <div className={styles.header__actions}>
          <button
            className={styles.header__settings_button}
            onClick={toggleSettings}
            aria-label={t('settings')}
          >
            {t('settingsButton', {
              language: t(`language${language === 'ru' ? 'Russian' : 'Kyrgyz'}`),
              city: city || t('cityPlaceholder'),
            })}
          </button>
          <NavLink
            to="/login"
            className={(props) => getNavLinkClass(props, 'login')}
          >
            <FaSignInAlt className={styles['header__nav-icon']} />
            {t('login')}
          </NavLink>
        </div>
        <button
          className={`${styles.header__burger} ${isMobileMenuOpen ? styles.open : ''}`}
          onClick={toggleMobileMenu}
          aria-label={t('settings')}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      {isMobileMenuOpen && (
        <>
          <div
            className={`${styles.header__mobileOverlay} ${isMobileMenuOpen ? styles.open : ''}`}
            onClick={closeMobileMenu}
          ></div>
          <div
            className={`${styles.header__mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}
          >
            <div className={styles.header__mobileNav}>
              <NavLink
                to="/"
                className={(props) => getNavLinkClass(props, 'home')}
                onClick={() => handleScroll('home')}
              >
                <FaHome className={styles['header__nav-icon']} />
                {t('home')}
              </NavLink>
              <NavLink
                to="/#about"
                className={(props) => getNavLinkClass(props, 'about')}
                onClick={() => handleScroll('about')}
              >
                <FaInfoCircle className={styles['header__nav-icon']} />
                {t('about')}
              </NavLink>
              <NavLink
                to="/favorites"
                className={(props) => getNavLinkClass(props, 'favorites')}
                onClick={closeMobileMenu}
              >
                <FaHeart className={styles['header__nav-icon']} />
                {t('favorites')}
              </NavLink>
              <NavLink
                to="/#contacts"
                className={(props) => getNavLinkClass(props, 'contacts')}
                onClick={() => handleScroll('contacts')}
              >
                <FaPhone className={styles['header__nav-icon']} />
                {t('contacts')}
              </NavLink>
              <NavLink
                to="/login"
                className={(props) => getNavLinkClass(props, 'login')}
                onClick={closeMobileMenu}
              >
                <FaSignInAlt className={styles['header__nav-icon']} />
                {t('login')}
              </NavLink>
              <button
                className={styles.header__mobile_settings_button}
                onClick={toggleSettings}
                aria-label={t('settings')}
              >
                {t('settingsButton', {
                  language: t(`language${language === 'ru' ? 'Russian' : 'Kyrgyz'}`),
                  city: city || t('cityPlaceholder'),
                })}
              </button>
            </div>
          </div>
        </>
      )}
      {isSettingsOpen && (
        <div className={styles.header__settings_modal}>
          <div className={styles.header__settings_content}>
            <button
              className={styles.header__settings_close}
              onClick={handleCloseSettings}
              aria-label={t('closeSettings')}
            ></button>
            <h3 className={styles.header__settings_title}>{t('settings')}</h3>
            <div className={styles.header__settings_group}>
              <label htmlFor="language">{t('language')}</label>
              <select
                id="language"
                value={tempLanguage}
                onChange={handleLanguageChange}
                className={styles.header__language}
                aria-label={t('selectLanguage')}
              >
                <option value="ru">{t('languageRussian')}</option>
                <option value="ky">{t('languageKyrgyz')}</option>
              </select>
            </div>
            <div className={styles.header__settings_group}>
              <label htmlFor="city">{t('city')}</label>
              <select
                id="city"
                value={tempCity}
                onChange={handleCityChange}
                className={styles.header__city}
                aria-label={t('selectCity')}
              >
                <option value="">{t('cityPlaceholder')}</option>
                <option value="Бишкек">{t('cityBishkek')}</option>
                <option value="Ош">{t('cityOsh')}</option>
              </select>
            </div>
            <button className={styles.header__save_button} onClick={handleSave}>
              {t('save')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;