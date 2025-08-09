import React, { useCallback, useMemo, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import { paymentOptions, trainers, sports, months, years, days } from '../../Constants/constants';
import './ClientFilter.scss';

const FilterComponent = ({ filters, setFilters }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, [setFilters]);

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const typeClientOptions = useMemo(() => [
    'Обычный', 'Пробный', 'Индивидуальный', 'Абонемент'
  ].map(type => (
    <option key={type} value={type}>{type}</option>
  )), []);

  const trainerOptions = useMemo(() => trainers.map(trainer => (
    <option key={trainer} value={trainer}>{trainer}</option>
  )), []);

  const sportOptions = useMemo(() => sports.map(sport => (
    <option key={sport} value={sport}>{sport}</option>
  )), []);

  const dayOptions = useMemo(() => days.map(day => (
    <option key={day} value={day}>{day}</option>
  )), []);

  const monthOptions = useMemo(() => months.map(month => (
    <option key={month} value={month}>{month}</option>
  )), []);

  const yearOptions = useMemo(() => years.map(year => (
    <option key={year} value={year}>{year}</option>
  )), []);

  const paymentOptionElements = useMemo(() => paymentOptions.map(option => (
    <option key={option.value} value={option.value}>{option.label}</option>
  )), []);

  return (
    <div className="filters">
      <button className="filters__toggle" onClick={toggleFilter} aria-label="Фильтры">
        <FaFilter />
      </button>
      <div className={`filters__container ${isFilterOpen ? 'filters__container--open' : ''}`}>
        <input
          className="filters__input"
          type="text"
          name="name"
          autoComplete="off"
          placeholder="Имя"
          value={filters.name}
          onChange={handleFilterChange}
          aria-label="Поиск по имени"
        />
        <select
          className="filters__select"
          name="typeClient"
          value={filters.typeClient}
          onChange={handleFilterChange}
          aria-label="Тип клиента"
        >
          <option value="">Тип клиента</option>
          {typeClientOptions}
        </select>
        <select
          className="filters__select"
          name="trainer"
          value={filters.trainer}
          onChange={handleFilterChange}
          aria-label="Тренер"
        >
          <option value="">Тренер</option>
          {trainerOptions}
        </select>
        <select
          className="filters__select"
          name="sport_category"
          value={filters.sport_category}
          onChange={handleFilterChange}
          aria-label="Спорт"
        >
          <option value="">Спорт</option>
          {sportOptions}
        </select>
        <select
          className="filters__select"
          name="day"
          value={filters.day}
          onChange={handleFilterChange}
          aria-label="День"
        >
          <option value="">День</option>
          {dayOptions}
        </select>
        <select
          className="filters__select"
          name="month"
          value={filters.month}
          onChange={handleFilterChange}
          aria-label="Месяц"
        >
          <option value="">Месяц</option>
          {monthOptions}
        </select>
        <select
          className="filters__select"
          name="year"
          value={filters.year}
          onChange={handleFilterChange}
          aria-label="Год"
        >
          <option value="">Год</option>
          {yearOptions}
        </select>
        <select
          className="filters__select"
          name="payment"
          value={filters.payment}
          onChange={handleFilterChange}
          aria-label="Оплата"
        >
          <option value="">Оплата</option>
          {paymentOptionElements}
        </select>
      </div>
    </div>
  );
};

export default FilterComponent;