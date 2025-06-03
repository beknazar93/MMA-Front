
import React, { useCallback, useMemo, useState } from 'react';
import { FaFilter } from 'react-icons/fa';

const FilterComponent = ({ filters, setFilters, trainers, sports, months, years, days }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  }, [setFilters]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const trainerOptions = useMemo(() => trainers.map(trainer => (
    <option key={trainer} value={trainer}>{trainer}</option>
  )), [trainers]);

  const sportOptions = useMemo(() => sports.map(sport => (
    <option key={sport} value={sport}>{sport}</option>
  )), [sports]);

  const dayOptions = useMemo(() => days.map(day => (
    <option key={day} value={day}>{day}</option>
  )), [days]);

  const monthOptions = useMemo(() => months.map(month => (
    <option key={month} value={month}>{month}</option>
  )), [months]);

  const yearOptions = useMemo(() => years.map(year => (
    <option key={year} value={year}>{year}</option>
  )), [years]);

  const paymentOptions = useMemo(() => [
    { value: "Оплачено", label: "Оплачено" },
    { value: "Не оплачено", label: "Не оплачено" }
  ].map(option => (
    <option key={option.value} value={option.value}>{option.label}</option>
  )), []);

  return (
    <div className="filters">
      <button
        className="filters__toggle"
        onClick={toggleFilter}
      >
        <FaFilter className="filters__toggle-icon" />
      </button>
      <div className={`filters__container ${isFilterOpen ? 'filters__container--open' : ''}`}>
        <input
          className="filters__input filters__input--text"
          type="text"
          name="name"
          autoComplete="off"
          placeholder="Поиск по имени"
          value={filters.name}
          onChange={handleFilterChange}
        />
        <select
          className="filters__input filters__input--select"
          name="trainer"
          value={filters.trainer}
          onChange={handleFilterChange}
        >
          <option value="">Тренера</option>
          {trainerOptions}
        </select>
        <select
          className="filters__input filters__input--select"
          name="sport_category"
          value={filters.sport_category}
          onChange={handleFilterChange}
        >
          <option value="">Спорт</option>
          {sportOptions}
        </select>
        <select
          className="filters__input filters__input--select"
          name="day"
          value={filters.day}
          onChange={handleFilterChange}
        >
          <option value="">День</option>
          {dayOptions}
        </select>
        <select
          className="filters__input filters__input--select"
          name="month"
          value={filters.month}
          onChange={handleFilterChange}
        >
          <option value="">Месяц</option>
          {monthOptions}
        </select>
        <select
          className="filters__input filters__input--select"
          name="year"
          value={filters.year}
          onChange={handleFilterChange}
        >
          <option value="">Год</option>
          {yearOptions}
        </select>
        <select
          className="filters__input filters__input--select"
          name="payment"
          value={filters.payment}
          onChange={handleFilterChange}
        >
          <option value="">Статус оплаты</option>
          {paymentOptions}
        </select>
      </div>
    </div>
  );
};

export default FilterComponent;