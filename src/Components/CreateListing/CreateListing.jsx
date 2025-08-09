import React, { useState, useEffect } from 'react';
import styles from './CreateListing.module.scss';

const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('Нет refresh токена');
  const response = await fetch('https://dar.kg/api/v1/users/auth/token/refresh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  }
  throw new Error('Ошибка обновления токена');
};

const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem('access_token');
  if (!token) {
    try {
      token = await refreshToken();
    } catch (err) {
      return { ok: false, status: 401, error: err.message };
    }
  }
  const headers = { ...options.headers, Authorization: `Bearer ${token}` };
  let response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    try {
      token = await refreshToken();
      headers.Authorization = `Bearer ${token}`;
      response = await fetch(url, { ...options, headers });
    } catch (err) {
      return { ok: false, status: 401, error: err.message };
    }
  }
  if (response.status === 403) {
    return { ok: false, status: 403, error: 'Недостаточно прав для выполнения действия' };
  }
  return response;
};

const CreateListing = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', price2: '', rooms: '', area: '', city: '', district: '', address: '',
    deal_type: '', property_type: '', floor: '', land_area: '', commercial_type: '', condition: '',
    utilities: '', purpose: '', location_id: '', document: '', complex: '', series: '', parking: false,
    string_fields1: '', string_fields2: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [locations, setLocations] = useState([]);
  const [complexes, setComplexes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetchWithAuth('https://dar.kg/api/v1/listings/locations/list/');
        if (response.ok) {
          setLocations(await response.json());
        } else {
          setError(`Ошибка загрузки локаций: ${response.status || response.error}`);
        }
      } catch (err) {
        setError('Ошибка загрузки локаций: ' + err.message);
      }
    };
    const fetchComplexes = async () => {
      try {
        const response = await fetch('https://dar.kg/api/v1/listings/single-field/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          setComplexes(await response.json());
        } else {
          setError(`Ошибка загрузки комплексов: ${response.status}`);
        }
      } catch (err) {
        setError('Ошибка загрузки комплексов: ' + err.message);
      }
    };
    const fetchProfile = async () => {
      try {
        const response = await fetchWithAuth('https://dar.kg/api/v1/users/me/');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role || '');
        } else {
          setError('Ошибка загрузки профиля');
        }
      } catch (err) {
        setError('Ошибка загрузки профиля: ' + err.message);
      }
    };
    fetchLocations();
    fetchComplexes();
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      if (name === 'city') {
        newFormData.district = '';
        newFormData.location_id = '';
      }
      if (name === 'district') {
        const selectedLocation = locations.find(
          loc => loc.city === newFormData.city && loc.district === value
        );
        newFormData.location_id = selectedLocation ? selectedLocation.id : '';
      }
      if (name === 'deal_type' || name === 'property_type') {
        newFormData.complex = '';
      }
      if (name === 'condition' && value !== 'delivery_date') {
        newFormData.string_fields2 = '';
      }
      // Сбрасываем deal_type при выборе house
      if (name === 'property_type' && value === 'house') {
        newFormData.deal_type = '';
      }
      return newFormData;
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
    setImagePreviews([...imagePreviews, ...files.map(file => URL.createObjectURL(file))]);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title) {
      setError('Заголовок обязателен');
      return;
    }
    if (!formData.description) {
      setError('Описание обязательно');
      return;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      setError('Цена обязательна и должна быть числом');
      return;
    }
    if (['admin', 'realtor'].includes(userRole) && (!formData.price2 || isNaN(parseFloat(formData.price2)))) {
      setError('Вторая цена обязательна и должна быть числом');
      return;
    }
    if (!formData.area || isNaN(parseFloat(formData.area))) {
      setError('Площадь обязательна и должна быть числом');
      return;
    }
    if (!formData.location_id) {
      setError('Выберите город и район');
      return;
    }
    if (!formData.address) {
      setError('Адрес обязателен');
      return;
    }
    if (formData.property_type !== 'house' && !formData.deal_type) {
      setError('Тип категории обязателен');
      return;
    }
    if (!formData.property_type) {
      setError('Тип недвижимости обязателен');
      return;
    }
    if (formData.property_type === 'apartment' && !formData.floor) {
      setError('Этаж обязателен для квартиры');
      return;
    }
    if (formData.property_type === 'house' && !formData.land_area) {
      setError('Площадь участка обязательна для дома');
      return;
    }
    if (formData.property_type === 'commercial' && !formData.commercial_type) {
      setError('Тип коммерции обязателен');
      return;
    }
    if (formData.deal_type === 'new_building' && !formData.complex) {
      setError('Комплекс обязателен для новостроек');
      return;
    }
    if (formData.condition === 'delivery_date' && !formData.string_fields2) {
      setError('Срок сдачи обязателен');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      if (['admin', 'realtor'].includes(userRole)) formDataToSend.append('price2', formData.price2);
      formDataToSend.append('area', formData.area);
      formDataToSend.append('address', formData.address);
      if (formData.property_type !== 'house') formDataToSend.append('deal_type', formData.deal_type);
      formDataToSend.append('property_type', formData.property_type);
      formDataToSend.append('is_active', 'true');
      formDataToSend.append('location_id', formData.location_id);
      formDataToSend.append('parking', formData.parking ? 'true' : 'false');
      if (formData.rooms) formDataToSend.append('rooms', formData.rooms);
      if (formData.floor && formData.property_type === 'apartment') {
        formDataToSend.append('floor', formData.floor);
        if (formData.string_fields1) formDataToSend.append('string_fields1', formData.string_fields1);
        if (formData.string_fields2) formDataToSend.append('string_fields2', formData.string_fields2);
      }
      if (formData.land_area && formData.property_type === 'house') formDataToSend.append('land_area', formData.land_area);
      if (formData.utilities && formData.property_type === 'house') formDataToSend.append('utilities', formData.utilities);
      if (formData.commercial_type && formData.property_type === 'commercial') formDataToSend.append('commercial_type', formData.commercial_type);
      if (formData.condition) formDataToSend.append('condition', formData.condition);
      if (formData.purpose && formData.property_type === 'commercial') formDataToSend.append('purpose', formData.purpose);
      if (formData.document) formDataToSend.append('document', formData.document);
      if (formData.complex && formData.deal_type === 'new_building') formDataToSend.append('single_field', formData.complex);
      if (formData.series) formDataToSend.append('series', formData.series);
      images.forEach(image => formDataToSend.append('media_files', image));

      const response = await fetchWithAuth('https://dar.kg/api/v1/listings/listings/', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        let errorDetail = 'Ошибка создания объявления';
        try {
          const data = await response.json();
          errorDetail = data.detail || JSON.stringify(data) || `HTTP ошибка: ${response.status}`;
        } catch {
          errorDetail = response.error || `HTTP ошибка: ${response.status}`;
        }
        setError(errorDetail);
        return;
      }

      setSuccess('Объявление создано!');
      setFormData({
        title: '', description: '', price: '', price2: '', rooms: '', area: '', city: '', district: '', address: '',
        deal_type: '', property_type: '', floor: '', land_area: '', commercial_type: '', condition: '',
        utilities: '', purpose: '', location_id: '', document: '', complex: '', series: '', parking: false,
        string_fields1: '', string_fields2: ''
      });
      setImages([]);
      setImagePreviews([]);
    } catch (err) {
      setError('Ошибка: ' + err.message);
    }
  };

  const renderSpecificFields = () => {
    const deliveryDateField = formData.condition === 'delivery_date' && (
      <div className={styles['create-listing__group']}>
        <label className={styles['create-listing__label']}>Срок сдачи</label>
        <input
          type="text"
          name="string_fields2"
          value={formData.string_fields2}
          onChange={handleChange}
          placeholder="Введите срок сдачи"
          required
          className={styles['create-listing__input']}
        />
      </div>
    );

    switch (formData.property_type) {
      case 'apartment':
        return (
          <div className={styles['create-listing__grid']}>
            <div className={styles['create-listing__group']}>
              <label className={styles['create-listing__label']}>Этаж</label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                placeholder="Введите этаж"
                required
                className={styles['create-listing__input']}
              />
            </div>
            <div className={styles['create-listing__group']}>
              <label className={styles['create-listing__label']}>Общее количество этажей</label>
              <input
                type="number"
                name="string_fields1"
                value={formData.string_fields1}
                onChange={handleChange}
                placeholder="Введите общее количество этажей"
                className={styles['create-listing__input']}
              />
            </div>
            <div className={styles['create-listing__group']}>
              <label className={styles['create-listing__label']}>Комнаты</label>
              <select
                name="rooms"
                value={formData.rooms}
                onChange={handleChange}
                className={styles['create-listing__select']}
              >
                <option value="">Выберите комнаты</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            {deliveryDateField}
          </div>
        );
      case 'house':
        return (
          <div className={styles['create-listing__grid']}>
            <div className={styles['create-listing__group']}>
              <label className={styles['create-listing__label']}>Площадь участка (сотки)</label>
              <input
                type="number"
                step="0.01"
                name="land_area"
                value={formData.land_area}
                onChange={handleChange}
                placeholder="Введите площадь"
                required
                className={styles['create-listing__input']}
              />
            </div>
            <div className={styles['create-listing__group']}>
              <label className={styles['create-listing__label']}>Коммуникации</label>
              <input
                type="text"
                name="utilities"
                value={formData.utilities}
                onChange={handleChange}
                placeholder="Введите коммуникации"
                className={styles['create-listing__input']}
              />
            </div>
            <div className={styles['create-listing__group']}>
              <label className={styles['create-listing__label']}>Комнаты</label>
              <select
                name="rooms"
                value={formData.rooms}
                onChange={handleChange}
                className={styles['create-listing__select']}
              >
                <option value="">Выберите комнаты</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            {deliveryDateField}
          </div>
        );
      case 'commercial':
        return (
          <div className={styles['create-listing__grid']}>
            <div className={styles['create-listing__group']}>
              <label className={styles['create-listing__label']}>Тип коммерции</label>
              <select
                name="commercial_type"
                value={formData.commercial_type}
                onChange={handleChange}
                required
                className={styles['create-listing__select']}
              >
                <option value="">Выберите тип</option>
                <option value="office">Офис</option>
                <option value="retail">Торговая площадь</option>
                <option value="warehouse">Склад</option>
                <option value="other">Прочее</option>
              </select>
            </div>
            <div className={styles['create-listing__group']}>
              <label className={styles['create-listing__label']}>Назначение</label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className={styles['create-listing__select']}
              >
                <option value="">Выберите назначение</option>
                <option value="cafe">Кафе/ресторан</option>
                <option value="shop">Магазин</option>
                <option value="office">Офис</option>
              </select>
            </div>
            <div className={styles['create-listing__group']}>
              <label className={styles['create-listing__label']}>Комнаты</label>
              <select
                name="rooms"
                value={formData.rooms}
                onChange={handleChange}
                className={styles['create-listing__select']}
              >
                <option value="">Выберите комнаты</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            {deliveryDateField}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles['create-listing']}>
      <h2 className={styles['create-listing__title']}>Создать объявление</h2>
      <form onSubmit={handleSubmit} className={styles['create-listing__form']}>
        <div className={styles['create-listing__grid']}>
          <div className={styles['create-listing__group']}>
            <label className={styles['create-listing__label']}>Тип недвижимости</label>
            <select
              name="property_type"
              value={formData.property_type}
              onChange={handleChange}
              required
              className={styles['create-listing__select']}
            >
              <option value="">Выберите тип</option>
              <option value="apartment">Квартира</option>
              <option value="house">Дом/Участок</option>
              <option value="commercial">Коммерческая</option>
            </select>
          </div>
          {formData.property_type !== 'house' && (
            <div className={styles['create-listing__group']}>
              <label className={styles['create-listing__label']}>Тип категории</label>
              <select
                name="deal_type"
                value={formData.deal_type}
                onChange={handleChange}
                required
                className={styles['create-listing__select']}
              >
                <option value="">Выберите категорию</option>
                <option value="secondary">Вторичная</option>
                <option value="new_building">Новостройки</option>
              </select>
            </div>
          )}
        </div>
        {formData.deal_type === 'new_building' && (
          <div className={styles['create-listing__group']}>
            <label className={styles['create-listing__label']}>Комплекс</label>
            <select
              name="complex"
              value={formData.complex}
              onChange={handleChange}
              required
              className={styles['create-listing__select']}
            >
              <option value="">Выберите комплекс</option>
              {complexes.map(complex => (
                <option key={complex.id} value={complex.id}>{complex.value}</option>
              ))}
            </select>
          </div>
        )}
        <div className={styles['create-listing__group']}>
          <label className={styles['create-listing__label']}>Заголовок</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Введите заголовок"
            required
            className={styles['create-listing__input']}
          />
        </div>
        <div className={styles['create-listing__group']}>
          <label className={styles['create-listing__label']}>Описание</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Введите описание"
            required
            className={styles['create-listing__textarea']}
          />
        </div>
        <div className={styles['create-listing__grid']}>
          <div className={styles['create-listing__group']}>
            <label className={styles['create-listing__label']}>Цена ($)</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Введите цену"
              required
              className={styles['create-listing__input']}
            />
          </div>
          {['admin', 'realtor'].includes(userRole) && (
            <div className={styles['create-listing__group']}>
              <label className={styles['create-listing__label']}>Вторая цена ($)</label>
              <input
                type="number"
                step="0.01"
                name="price2"
                value={formData.price2}
                onChange={handleChange}
                placeholder="Введите вторую цену"
                required
                className={styles['create-listing__input']}
              />
            </div>
          )}
          <div className={styles['create-listing__group']}>
            <label className={styles['create-listing__label']}>Площадь (кв.м.)</label>
            <input
              type="number"
              step="0.01"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="Введите площадь"
              required
              className={styles['create-listing__input']}
            />
          </div>
        </div>
        <div className={styles['create-listing__grid']}>
          <div className={styles['create-listing__group']}>
            <label className={styles['create-listing__label']}>Город</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className={styles['create-listing__select']}
            >
              <option value="">Выберите город</option>
              {[...new Set(locations.map(loc => loc.city))].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className={styles['create-listing__group']}>
            <label className={styles['create-listing__label']}>Район</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              className={styles['create-listing__select']}
            >
              <option value="">Выберите район</option>
              {locations
                .filter(loc => !formData.city || loc.city === formData.city)
                .map(location => (
                  <option key={location.id} value={location.district}>{location.district}</option>
                ))}
            </select>
          </div>
        </div>
        <div className={styles['create-listing__group']}>
          <label className={styles['create-listing__label']}>Адрес</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Введите адрес"
            required
            className={styles['create-listing__input']}
          />
        </div>
        <div className={styles['create-listing__grid']}>
          <div className={styles['create-listing__group']}>
            <label className={styles['create-listing__label']}>Состояние</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className={styles['create-listing__select']}
            >
              <option value="">Выберите состояние</option>
              <option value="renovated">С ремонтом</option>
              <option value="no_renovation">Без ремонта</option>
              <option value="pso">Сдан ПСО</option>
              <option value="euro_remont">Евроремонт</option>
              <option value="delivery_date">Срок сдачи</option>
            </select>
          </div>
          <div className={styles['create-listing__group']}>
            <label className={styles['create-listing__label']}>Документ</label>
            <select
              name="document"
              value={formData.document}
              onChange={handleChange}
              className={styles['create-listing__select']}
            >
              <option value="">Выберите документ</option>
              <option value="general_power_of_attorney">Генеральная доверенность</option>
              <option value="gift_agreement">Договор дарения</option>
              <option value="equity_participation_agreement">Договор долевого участия</option>
              <option value="sale_purchase_agreement">Договор купли-продажи</option>
              <option value="red_book">Красная книга</option>
              <option value="technical_passport">Техпаспорт</option>
            </select>
          </div>
          <div className={styles['create-listing__group']}>
            <label className={styles['create-listing__label']}>Серия</label>
            <select
              name="series"
              value={formData.series}
              onChange={handleChange}
              className={styles['create-listing__select']}
            >
              <option value="">Выберите серию</option>
              <option value="104_series">104-я серия</option>
              <option value="105_series">105-я серия</option>
              <option value="106_series">106-я серия</option>
              <option value="individual_project">Индивидуальный проект</option>
              <option value="khrushchevka">Хрущевка</option>
              <option value="stalinka">Сталинка</option>
            </select>
          </div>
        </div>
        {formData.property_type && renderSpecificFields()}
        <div className={styles['create-listing__group']}>
          <label className={styles['create-listing__label']}>Изображения</label>
          <div className={styles['create-listing__image-upload']}>
            <label className={styles['create-listing__image-label']}>
              Загрузить изображения
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className={styles['create-listing__image-input']}
              />
            </label>
            <div className={styles['create-listing__image-previews']}>
              {imagePreviews.map((preview, index) => (
                <div key={index} className={styles['create-listing__image-preview']}>
                  <img src={preview} alt={`Превью ${index}`} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className={styles['create-listing__image-remove']}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {error && <p className={styles['create-listing__error']}>{error}</p>}
        {success && <p className={styles['create-listing__success']}>{success}</p>}
        <button type="submit" className={styles['create-listing__button']}>Создать объявление</button>
      </form>
    </div>
  );
};

export default CreateListing;