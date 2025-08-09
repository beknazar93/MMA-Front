import React, { useState, useEffect, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import axios from 'axios';
import styles from './HeroSection.module.scss';

const HeroSection = ({ onSearch, selectedCity, language }) => {
  const intl = useIntl();
  const [filters, setFilters] = useState({
    property_type: '',
    city: selectedCity || '',
    district: '',
    price_min: '',
    price_max: '',
    rooms: '',
    area_min: '',
    area_max: '',
    floor_min: '',
    floor_max: '',
    land_area_min: '',
    land_area_max: '',
    commercial_type: '',
    condition: '',
    purpose: '',
    document: '',
    series: '',
    deal_type: '',
    complex: '',
  });
  const [locations, setLocations] = useState([]);
  const [complexes, setComplexes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  const selectOptions = {
    series: [
      { value: '104_series', label: intl.formatMessage({ id: 'series_104', defaultMessage: '104 серия' }) },
      { value: '105_series', label: intl.formatMessage({ id: 'series_105', defaultMessage: '105 серия' }) },
      { value: '106_series', label: intl.formatMessage({ id: 'series_106', defaultMessage: '106 серия' }) },
      { value: 'individual_project', label: intl.formatMessage({ id: 'series_individual', defaultMessage: 'Индивидуальный проект' }) },
      { value: 'khrushchevka', label: intl.formatMessage({ id: 'series_khrushchevka', defaultMessage: 'Хрущевка' }) },
      { value: 'stalinka', label: intl.formatMessage({ id: 'series_stalinka', defaultMessage: 'Сталинка' }) },
    ],
    condition: [
      { value: 'renovated', label: intl.formatMessage({ id: 'condition_renovated', defaultMessage: 'Отремонтировано' }) },
      { value: 'no_renovation', label: intl.formatMessage({ id: 'condition_no_renovation', defaultMessage: 'Без ремонта' }) },
      { value: 'pso', label: intl.formatMessage({ id: 'condition_pso', defaultMessage: 'ПСО' }) },
      { value: 'euro_remont', label: intl.formatMessage({ id: 'condition_euro_remont', defaultMessage: 'Евроремонт' }) },
      { value: 'delivery_date', label: intl.formatMessage({ id: 'condition_delivery_date', defaultMessage: 'Срок сдачи' }) },
    ],
    document: [
      { value: 'general_power_of_attorney', label: intl.formatMessage({ id: 'document_general_power_of_attorney', defaultMessage: 'Генеральная доверенность' }) },
      { value: 'gift_agreement', label: intl.formatMessage({ id: 'document_gift_agreement', defaultMessage: 'Договор дарения' }) },
      { value: 'equity_participation_agreement', label: intl.formatMessage({ id: 'document_equity_participation_agreement', defaultMessage: 'Договор долевого участия' }) },
      { value: 'sale_purchase_agreement', label: intl.formatMessage({ id: 'document_sale_purchase_agreement', defaultMessage: 'Договор купли-продажи' }) },
      { value: 'red_book', label: intl.formatMessage({ id: 'document_red_book', defaultMessage: 'Красная книга' }) },
      { value: 'technical_passport', label: intl.formatMessage({ id: 'document_technical_passport', defaultMessage: 'Технический паспорт' }) },
    ],
    commercial_type: [
      { value: 'office', label: intl.formatMessage({ id: 'commercial_type_office', defaultMessage: 'Офис' }) },
      { value: 'retail', label: intl.formatMessage({ id: 'commercial_type_retail', defaultMessage: 'Торговая площадь' }) },
      { value: 'warehouse', label: intl.formatMessage({ id: 'commercial_type_warehouse', defaultMessage: 'Склад' }) },
      { value: 'other', label: intl.formatMessage({ id: 'commercial_type_other', defaultMessage: 'Другое' }) },
    ],
    purpose: [
      { value: 'cafe', label: intl.formatMessage({ id: 'purpose_cafe', defaultMessage: 'Кафе' }) },
      { value: 'shop', label: intl.formatMessage({ id: 'purpose_shop', defaultMessage: 'Магазин' }) },
      { value: 'office', label: intl.formatMessage({ id: 'purpose_office', defaultMessage: 'Офис' }) },
    ],
    deal_type: [
      { value: 'secondary', label: intl.formatMessage({ id: 'deal_type_default', defaultMessage: 'Вторичка' }) },
      { value: 'new_building', label: intl.formatMessage({ id: 'deal_type_new_building', defaultMessage: 'Новостройка' }) },
    ],
    rooms: [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4+' },
    ],
  };

  const showToast = (messageId, type) => {
    setToast({ message: intl.formatMessage({ id: messageId, defaultMessage: 'Ошибка' }), type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  useEffect(() => {
    if (selectedCity && selectedCity !== filters.city) {
      setFilters((prev) => ({ ...prev, city: selectedCity, district: '', location_id: '' }));
    }
  }, [selectedCity]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('https://dar.kg/api/v1/listings/locations/list/');
        if (Array.isArray(response.data)) {
          setLocations(response.data);
        } else {
          showToast('error_fetch_locations', 'error');
        }
      } catch (error) {
        console.error('Ошибка fetchLocations:', error);
        showToast('error_fetch_locations', 'error');
        setLocations([]);
      }
    };

    const fetchComplexes = async () => {
      try {
        const response = await axios.get('https://dar.kg/api/v1/listings/single-field/');
        if (Array.isArray(response.data)) {
          setComplexes(response.data);
        } else {
          showToast('error_fetch_complexes', 'error');
        }
      } catch (error) {
        console.error('Ошибка fetchComplexes:', error);
        showToast('error_fetch_complexes', 'error');
        setComplexes([]);
      }
    };

    Promise.all([fetchLocations(), fetchComplexes()]).then(() => setIsLoading(false));
  }, []);

  const validateNumber = (value) => {
    if (value === '') return true;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  };

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    if (['price_min', 'price_max', 'area_min', 'area_max', 'floor_min', 'floor_max', 'land_area_min', 'land_area_max'].includes(name)) {
      if (!validateNumber(value)) {
        showToast('invalid_number', 'error');
        return;
      }
    }
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'city' && { district: '', location_id: '' }),
      ...(name === 'district' && {
        location_id: locations.find((loc) => loc.city === prev.city && loc.district === value)?.id || '',
      }),
      ...(name === 'deal_type' && { complex: '' }),
    }));
  }, [locations]);

  const handleTabClick = useCallback((propertyType) => {
    setFilters((prev) => ({
      ...prev,
      property_type: propertyType,
      commercial_type: '',
      purpose: '',
      floor_min: '',
      floor_max: '',
      land_area_min: '',
      land_area_max: '',
      rooms: '',
      deal_type: '',
      complex: '',
      condition: '',
      document: '',
      series: '',
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const filteredFilters = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => {
        if (['condition', 'document', 'series'].includes(key) && !filters.property_type) {
          return false; // Исключаем фильтры, если property_type не выбран
        }
        return value !== '';
      })
    );
    try {
      const query = new URLSearchParams(filteredFilters).toString();
      const response = await axios.get(`https://dar.kg/api/v1/listings/listings/?${query}`);
      const count = Array.isArray(response.data) ? response.data.length : response.data.count || 0;
      onSearch(filteredFilters, count);
      const listingsSection = document.getElementById('listings');
      if (listingsSection) {
        listingsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Ошибка handleSubmit:', error);
      showToast('error_fetch_listings', 'error');
      onSearch(filteredFilters, 0);
    }
  }, [filters, onSearch]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      property_type: '',
      city: '',
      district: '',
      price_min: '',
      price_max: '',
      rooms: '',
      area_min: '',
      area_max: '',
      floor_min: '',
      floor_max: '',
      land_area_min: '',
      land_area_max: '',
      commercial_type: '',
      condition: '',
      purpose: '',
      document: '',
      series: '',
      deal_type: '',
      complex: '',
    });
    onSearch({}, 0);
  }, [onSearch]);

  const renderTabIcon = (propertyType) => {
    const icons = {
      apartment: <path d="M4 4h16v16H4zM4 10h16M10 4v16M14 4v16" />,
      house: <path d="M12 2L2 10v12h20V10L12 2zm0 3l8 6v10H4V11l8-6z" />,
      commercial: <path d="M3 6h18v14H3zM6 10h12M6 14h12M6 18h12" />,
    };
    return propertyType ? (
      <svg className={styles['hero-section__tab-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        {icons[propertyType]}
      </svg>
    ) : null;
  };

  const renderSelect = (name, options, labelId) => (
    <select
      name={name}
      value={filters[name]}
      onChange={handleFilterChange}
      className={styles['hero-section__filter']}
      aria-label={intl.formatMessage({ id: labelId, defaultMessage: labelId })}
      disabled={isLoading || !filters.property_type} // Блокируем селекты без property_type
    >
      <option value="">{intl.formatMessage({ id: labelId, defaultMessage: labelId })}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const renderInput = (name, labelId, type = 'number') => (
    <input
      type={type}
      name={name}
      value={filters[name]}
      onChange={handleFilterChange}
      placeholder={intl.formatMessage({ id: labelId, defaultMessage: labelId })}
      className={styles['hero-section__filter']}
      aria-label={intl.formatMessage({ id: labelId, defaultMessage: labelId })}
      disabled={isLoading}
    />
  );

  const renderSpecificFilters = () => {
    switch (filters.property_type) {
      case 'apartment':
        return (
          <div className={styles['hero-section__specific-filters']}>
            <div className={styles['hero-section__filter-group']}>
              <span className={styles['hero-section__filter-label']}>
                <FormattedMessage id="apartment_params" defaultMessage="Параметры квартиры" />
              </span>
              {renderSelect('rooms', selectOptions.rooms, 'rooms')}
              {renderInput('floor_min', 'floor_min')}
              {renderInput('floor_max', 'floor_max')}
            </div>
          </div>
        );
      case 'house':
        return (
          <div className={styles['hero-section__specific-filters']}>
            <div className={styles['hero-section__filter-group']}>
              <span className={styles['hero-section__filter-label']}>
                <FormattedMessage id="house_params" defaultMessage="Параметры дома" />
              </span>
              {renderInput('land_area_min', 'land_area_min')}
              {renderInput('land_area_max', 'land_area_max')}
              {renderSelect('rooms', selectOptions.rooms, 'rooms')}
            </div>
          </div>
        );
      case 'commercial':
        return (
          <div className={styles['hero-section__specific-filters']}>
            <div className={styles['hero-section__filter-group']}>
              <span className={styles['hero-section__filter-label']}>
                <FormattedMessage id="commercial_params" defaultMessage="Параметры коммерческой недвижимости" />
              </span>
              {renderSelect('commercial_type', selectOptions.commercial_type, 'commercial_type')}
              {renderSelect('purpose', selectOptions.purpose, 'purpose')}
              {renderSelect('rooms', selectOptions.rooms, 'rooms')}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const shouldShowPropertyParams = () => filters.property_type !== 'house' || filters.deal_type === 'new_building';

  return (
    <div className={styles['hero-section']}>
      <div className={styles['hero-section__container']}>
        {isLoading && (
          <div className={styles['hero-section__loading']}>
            <FormattedMessage id="loading" defaultMessage="Загрузка..." />
          </div>
        )}
        {toast.message && (
          <div className={`${styles['hero-section__toast']} ${styles[`hero-section__toast--${toast.type}`]}`}>
            {toast.message}
          </div>
        )}
        <h1 className={styles['hero-section__title']}>
          <FormattedMessage id="hero_title" defaultMessage="Найдите идеальную недвижимость" />
        </h1>
        <form onSubmit={handleSubmit} className={styles['hero-section__form']}>
          <div className={styles['hero-section__tabs']}>
            {['', 'apartment', 'house', 'commercial'].map((type) => (
              <button
                key={type || 'all'}
                type="button"
                className={`${styles['hero-section__tab']} ${filters.property_type === type ? styles['hero-section__tab--active'] : ''}`}
                onClick={() => handleTabClick(type)}
                aria-selected={filters.property_type === type}
                aria-label={intl.formatMessage({ id: `tab_${type || 'all'}`, defaultMessage: type || 'Все' })}
                disabled={isLoading}
              >
                {renderTabIcon(type)}
                <FormattedMessage id={`tab_${type || 'all'}`} defaultMessage={type || 'Все'} />
              </button>
            ))}
          </div>
          <div className={styles['hero-section__filters']}>
            {shouldShowPropertyParams() && (
              <div className={styles['hero-section__filter-group']}>
                <span className={styles['hero-section__filter-label']}>
                  <FormattedMessage id="type_and_complex_label" defaultMessage="Тип и комплекс" />
                </span>
                {filters.property_type !== 'house' && renderSelect('deal_type', selectOptions.deal_type, 'deal_type')}
                {filters.deal_type === 'new_building' && complexes.length > 0 && (
                  <select
                    name="complex"
                    value={filters.complex}
                    onChange={handleFilterChange}
                    className={styles['hero-section__filter']}
                    aria-label={intl.formatMessage({ id: 'complex', defaultMessage: 'Комплекс' })}
                    disabled={isLoading || !complexes.length}
                  >
                    <option value="">{intl.formatMessage({ id: 'complex', defaultMessage: 'Комплекс' })}</option>
                    {[...new Set(complexes.map(c => c.id))].map((id) => {
                      const complex = complexes.find(c => c.id === id);
                      return (
                        <option key={complex.id} value={complex.id}>
                          {complex.value}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            )}
            <div className={styles['hero-section__filter-group']}>
              <span className={styles['hero-section__filter-label']}>
                <FormattedMessage id="location_label" defaultMessage="Местоположение" />
              </span>
              <select
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className={styles['hero-section__filter']}
                aria-label={intl.formatMessage({ id: 'city', defaultMessage: 'Город' })}
                disabled={isLoading || !locations.length}
              >
                <option value="">{intl.formatMessage({ id: 'city', defaultMessage: 'Город' })}</option>
                {[...new Set(locations.map((loc) => loc.city))].map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <select
                name="district"
                value={filters.district}
                onChange={handleFilterChange}
                className={styles['hero-section__filter']}
                aria-label={intl.formatMessage({ id: 'district', defaultMessage: 'Район' })}
                disabled={isLoading || !filters.city || !locations.length}
              >
                <option value="">{intl.formatMessage({ id: 'district', defaultMessage: 'Район' })}</option>
                {[...new Set(locations
                  .filter((loc) => !filters.city || loc.city === filters.city)
                  .map((loc) => loc.district))].map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
              </select>
            </div>
            <div className={styles['hero-section__filter-group']}>
              <span className={styles['hero-section__filter-label']}>
                <FormattedMessage id="price_and_area_label" defaultMessage="Цена и площадь" />
              </span>
              {renderInput('price_min', 'price_min')}
              {renderInput('price_max', 'price_max')}
              {renderInput('area_min', 'area_min')}
              {renderInput('area_max', 'area_max')}
            </div>
            <div className={styles['hero-section__filter-group']}>
              <span className={styles['hero-section__filter-label']}>
                <FormattedMessage id="condition_label" defaultMessage="Состояние и документы" />
              </span>
              {renderSelect('condition', selectOptions.condition, 'condition')}
              {renderSelect('document', selectOptions.document, 'document')}
              {renderSelect('series', selectOptions.series, 'series')}
            </div>
            {renderSpecificFilters()}
            <div className={styles['hero-section__button-group']}>
              <button type="submit" className={styles['hero-section__search-button']} disabled={isLoading}>
                <FormattedMessage id="search_button" defaultMessage="Поиск" />
              </button>
              <button
                type="button"
                className={styles['hero-section__clear-button']}
                onClick={handleClearFilters}
                aria-label={intl.formatMessage({ id: 'clear_filters_label', defaultMessage: 'Очистить фильтры' })}
                disabled={isLoading}
              >
                <FormattedMessage id="clear_button" defaultMessage="Очистить" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroSection;