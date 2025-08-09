import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import axios from 'axios';
import styles from './Listings.module.scss';

const refreshToken = async (intl) => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error(intl.formatMessage({ id: 'error_no_refresh_token', defaultMessage: 'Нет токена обновления' }));
  const response = await axios.post('https://dar.kg/api/v1/users/auth/token/refresh/', { refresh });
  localStorage.setItem('access_token', response.data.access);
  return response.data.access;
};

const fetchWithAuth = async (url, options = {}, intl) => {
  let token = localStorage.getItem('access_token');
  const headers = { ...options.headers, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  try {
    if (!token) {
      token = await refreshToken(intl);
      headers.Authorization = `Bearer ${token}`;
    }
    return await axios({ url, ...options, headers });
  } catch (err) {
    if (err.response?.status === 401) {
      try {
        token = await refreshToken(intl);
        headers.Authorization = `Bearer ${token}`;
        return await axios({ url, ...options, headers });
      } catch (refreshErr) {
        return { ok: false, status: 401, error: intl.formatMessage({ id: 'error_token_refresh', defaultMessage: 'Ошибка обновления токена' }) };
      }
    }
    if (err.response?.status === 403) {
      return { ok: false, status: 403, error: intl.formatMessage({ id: 'error_forbidden', defaultMessage: 'Доступ запрещен' }) };
    }
    throw err;
  }
};

const ListingModal = ({
  selectedListing,
  closeModal,
  currentImageIndex,
  setCurrentImageIndex,
  showRequestForm,
  toggleRequestForm,
  handleLike,
  handleFavorite,
  handleShare,
  handleWhatsApp,
  likedListings,
  favorites,
  requestData,
  handleRequestChange,
  handleRequestSubmit,
}) => {
  const intl = useIntl();
  const [agentData, setAgentData] = useState({
    name: selectedListing?.owner?.username || intl.formatMessage({ id: 'agent_name_default', defaultMessage: 'Агент' }),
    phone: selectedListing?.owner?.phone || '+996 XXX XXX XXX',
    image: selectedListing?.owner?.avatar || 'https://via.placeholder.com/100',
    role: selectedListing?.owner?.role || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [userRole, setUserRole] = useState('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showModalHint, setShowModalHint] = useState(true);
  const [showFullScreenHint, setShowFullScreenHint] = useState(true);
  const [complexName, setComplexName] = useState('');
  const USD_RATE = 85;
  const DESCRIPTION_MAX_LENGTH = 200;

  const showToast = (messageId, type) => {
    setToast({ message: intl.formatMessage({ id: messageId, defaultMessage: 'Ошибка' }), type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetchWithAuth('https://dar.kg/api/v1/users/me/', {}, intl);
        setUserRole(response.data.role || '');
      } catch {
        setUserRole('');
      }
    };

    const fetchComplexName = async () => {
      if (selectedListing?.deal_type === 'new_building' && selectedListing?.single_field) {
        try {
          const response = await axios.get(`https://dar.kg/api/v1/listings/single-field/${selectedListing.single_field}/`);
          setComplexName(response.data.value || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' }));
        } catch (err) {
          setComplexName(intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' }));
        }
      }
    };

    fetchUserProfile();
    fetchComplexName();
    if (selectedListing?.owner) {
      setAgentData({
        name: selectedListing.owner.username || intl.formatMessage({ id: 'agent_name_default', defaultMessage: 'Агент' }),
        phone: selectedListing.owner.phone || '+996 XXX XXX XXX',
        image: selectedListing.owner.avatar || 'https://via.placeholder.com/100',
        role: selectedListing.owner.role || '',
      });
    }
    setShowModalHint(true);
    const modalTimer = setTimeout(() => setShowModalHint(false), 3000);
    return () => clearTimeout(modalTimer);
  }, [selectedListing, intl]);

  useEffect(() => {
    if (isFullScreen) {
      setShowFullScreenHint(true);
      const timer = setTimeout(() => setShowFullScreenHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isFullScreen]);

  const formatters = {
    series: (series) => ({
      '104_series': 'series_104',
      '105_series': 'series_105',
      '106_series': 'series_106',
      individual_project: 'series_individual',
      khrushchevka: 'series_khrushchevka',
      stalinka: 'series_stalinka',
    }[series] || 'not_specified'),
    propertyType: (type) => ({
      apartment: 'property_apartment',
      house: 'property_house',
      commercial: 'property_commercial',
    }[type] || 'not_specified'),
    condition: (type) => ({
      renovated: 'condition_renovated',
      no_renovation: 'condition_no_renovation',
      pso: 'condition_pso',
      euro_remont: 'condition_euro_remont',
      delivery_date: 'condition_delivery_date',
    }[type] || 'not_specified'),
    document: (document) => ({
      general_power_of_attorney: 'document_general_power_of_attorney',
      gift_agreement: 'document_gift_agreement',
      equity_participation_agreement: 'document_equity_participation_agreement',
      sale_purchase_agreement: 'document_sale_purchase_agreement',
      red_book: 'document_red_book',
      technical_passport: 'document_technical_passport',
    }[document] || 'not_specified'),
    purpose: (purpose) => ({
      cafe: 'purpose_cafe',
      shop: 'purpose_shop',
      office: 'purpose_office',
    }[purpose] || 'not_specified'),
    commercialType: (type) => ({
      office: 'commercial_type_office',
      retail: 'commercial_type_retail',
      warehouse: 'commercial_type_warehouse',
      other: 'commercial_type_other',
    }[type] || 'not_specified'),
    dealType: (type) => ({
      secondary: 'deal_type_default',
      new_building: 'deal_type_new_building',
    }[type] || 'not_specified'),
    utilities: (utilities) => ({
      all: 'utilities_all',
      partial: 'utilities_partial',
      none: 'utilities_none',
    }[utilities] || 'not_specified'),
  };

  const handleImageClick = () => {
    setIsFullScreen(true);
    setShowFullScreenHint(true);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
    setShowFullScreenHint(false);
  };

  const nextImage = () => {
    if (selectedListing?.images?.length > 0) {
      setCurrentImageIndex((prev) => prev === selectedListing.images.length - 1 ? 0 : prev + 1);
    }
  };

  const prevImage = () => {
    if (selectedListing?.images?.length > 0) {
      setCurrentImageIndex((prev) => prev === 0 ? selectedListing.images.length - 1 : prev - 1);
    }
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleWhatsAppClick = () => {
    if (selectedListing && agentData.phone !== '+996 XXX XXX XXX') {
      const cleanPhone = agentData.phone.replace(/\D/g, '');
      const message = encodeURIComponent(
        intl.formatMessage(
          { id: 'whatsapp_message', defaultMessage: 'Здравствуйте, интересуюсь объявлением: {title}, {city}, {district}' },
          { title: selectedListing.title || intl.formatMessage({ id: 'no_title', defaultMessage: 'Без названия' }), city: selectedListing.location?.city || '', district: selectedListing.location?.district || '' }
        )
      );
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    } else {
      showToast('error_no_phone', 'error');
    }
  };

  const handleRequestSubmitWithListing = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setToast({ message: '', type: '' });
    try {
      const enhancedMessage = `${requestData.message}\n\n[${intl.formatMessage({ id: 'listing', defaultMessage: 'Объявление' })}: "${selectedListing.title || intl.formatMessage({ id: 'no_title', defaultMessage: 'Без названия' })}"}]`;
      await fetchWithAuth('https://dar.kg/api/v1/listings/bit/', {
        method: 'POST',
        data: {
          name: requestData.name,
          contact_phone: requestData.contact_phone,
          message: enhancedMessage,
          listing: selectedListing.id,
        },
      }, intl);
      handleRequestSubmit(e);
      toggleRequestForm();
      showToast('request_success', 'success');
    } catch (err) {
      showToast('error_submit_request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDetails = () => {
    const descriptionText = selectedListing?.description || intl.formatMessage({ id: 'no_description', defaultMessage: 'Без описания' });
    const isLongDescription = descriptionText.length > DESCRIPTION_MAX_LENGTH;

    const details = [
      { label: 'likes', value: selectedListing?.likes_count || 0 },
      { label: 'property_type', value: formatters.propertyType(selectedListing?.property_type) },
      ...(selectedListing?.property_type !== 'house' ? [{ label: 'deal_type', value: formatters.dealType(selectedListing?.deal_type) || 'not_specified' }] : []),
      ...(selectedListing?.deal_type === 'new_building' ? [{ 
        label: 'complex', 
        value: complexName || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' })
      }] : []),
      { label: 'city', value: selectedListing?.location?.city || 'not_specified' },
      { label: 'district', value: selectedListing?.location?.district || 'not_specified' },
      { label: 'address', value: selectedListing?.address || 'not_specified' },
      { 
        label: 'price', 
        value: (
          <span className={styles.dollar}>
            ${parseFloat(selectedListing?.price || 0).toFixed(2)} / {(selectedListing?.price * USD_RATE || 0).toLocaleString('ru-RU')} <FormattedMessage id="som" defaultMessage="сом" />
          </span>
        ),
      },
      ...(userRole === 'admin' || userRole === 'realtor' && selectedListing?.price2
        ? [{
            label: 'price2',
            value: (
              <span className={styles.dollar}>
                ${parseFloat(selectedListing.price2 || 0).toFixed(2)} / {(selectedListing.price2 * USD_RATE || 0).toLocaleString('ru-RU')} <FormattedMessage id="som" defaultMessage="сом" />
              </span>
            ),
          }]
        : []),
      { 
        label: 'area', 
        value: selectedListing?.area 
          ? `${parseFloat(selectedListing.area).toFixed(2)} ${intl.formatMessage({ id: 'square_meters', defaultMessage: 'м²' })}` 
          : 'N/A' 
      },
      ...(selectedListing?.rooms ? [{ label: 'rooms', value: selectedListing.rooms }] : []),
      ...(selectedListing?.floor && selectedListing?.property_type === 'apartment'
        ? [{ label: 'floor', value: selectedListing.floor }]
        : []),
      ...(selectedListing?.string_fields1 && selectedListing?.property_type === 'apartment'
        ? [{ label: 'total_floors', value: selectedListing.string_fields1 }]
        : []),
      ...(selectedListing?.string_fields2 && selectedListing?.condition === 'delivery_date'
        ? [{ label: 'delivery_date', value: selectedListing.string_fields2 }]
        : []),
      ...(selectedListing?.land_area && selectedListing?.property_type === 'house'
        ? [{ label: 'land_area', value: `${selectedListing.land_area} ${intl.formatMessage({ id: 'sotka', defaultMessage: 'соток' })}` }]
        : []),
      ...(selectedListing?.utilities && selectedListing?.property_type === 'house'
        ? [{ label: 'utilities', value: formatters.utilities(selectedListing.utilities) }]
        : []),
      ...(selectedListing?.commercial_type && selectedListing?.property_type === 'commercial'
        ? [{ label: 'commercial_type', value: formatters.commercialType(selectedListing.commercial_type) }]
        : []),
      ...(selectedListing?.purpose && selectedListing?.property_type === 'commercial'
        ? [{ label: 'purpose', value: formatters.purpose(selectedListing.purpose) }]
        : []),
      ...(selectedListing?.condition
        ? [{ label: 'condition', value: formatters.condition(selectedListing.condition) }]
        : []),
      ...(selectedListing?.document
        ? [{ label: 'document', value: formatters.document(selectedListing.document) }]
        : []),
      ...(selectedListing?.series
        ? [{ label: 'series', value: formatters.series(selectedListing.series) }]
        : []),
      ...(selectedListing?.parking
        ? [{ label: 'parking', value: selectedListing.parking ? intl.formatMessage({ id: 'parking_available', defaultMessage: 'Есть парковка' }) : intl.formatMessage({ id: 'no_parking', defaultMessage: 'Нет парковки' }) }]
        : []),
      { 
        label: 'created_at', 
        value: selectedListing?.created_at 
          ? new Date(selectedListing.created_at).toLocaleDateString('ru-RU') 
          : 'N/A' 
      },
    ];

    const description = {
      label: 'description',
      value: (
        <div className={styles.listings__modal_description} data-expanded={isDescriptionExpanded}>
          <FormattedMessage
            id={isLongDescription && !isDescriptionExpanded ? 'description_truncated' : descriptionText}
            defaultMessage={isLongDescription && !isDescriptionExpanded ? `${descriptionText.slice(0, DESCRIPTION_MAX_LENGTH)}...` : descriptionText}
          />
          {isLongDescription && (
            <button
              type="button"
              className={styles.listings__modal_description_toggle}
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <FormattedMessage id={isDescriptionExpanded ? 'show_less' : 'show_more'} defaultMessage={isDescriptionExpanded ? 'Свернуть' : 'Показать больше'} />
            </button>
          )}
        </div>
      ),
    };

    return (
      <>
        <div className={styles.listings__modal_details}>
          {details.filter(detail => detail.label !== 'description').map(({ label, value }, index) => (
            <p key={index}>
              <strong><FormattedMessage id={label} defaultMessage={label} />:</strong>{' '}
              {typeof value === 'string' && !value.includes('<FormattedMessage') ? <FormattedMessage id={value} defaultMessage={value} /> : value}
            </p>
          ))}
        </div>
        <div className={styles.listings__modal_description_wrapper}>
          <p>
            <strong><FormattedMessage id={description.label} defaultMessage={description.label} />:</strong>{' '}
            {description.value}
          </p>
        </div>
      </>
    );
  };

  const renderSlider = () => {
    if (!selectedListing?.images?.length || !selectedListing.images[currentImageIndex]?.image) {
      return <p className={styles.listings__modal_no_images}><FormattedMessage id="no_images" defaultMessage="Нет изображений" /></p>;
    }

    return (
      <div className={styles.listings__modal_slider}>
        <div className={styles.listings__modal_image_wrapper}>
          <img
            src={selectedListing.images[currentImageIndex].image}
            alt={intl.formatMessage({ id: 'slide_alt', defaultMessage: 'Слайд {index}' }, { index: currentImageIndex + 1 })}
            className={styles.listings__modal_image}
            onClick={handleImageClick}
            onError={(e) => (e.target.src = 'https://via.placeholder.com/400')}
          />
          {showModalHint && (
            <div className={styles.listings__modal_hint}>
              <FormattedMessage id="tap_to_view" defaultMessage="Нажмите, чтобы посмотреть" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFullScreenSlider = () => {
    if (!selectedListing?.images?.length || !selectedListing.images[currentImageIndex]?.image) {
      return null;
    }

    return (
      <div className={styles.listings__fullscreen_slider} onClick={closeFullScreen}>
        <button onClick={closeFullScreen} className={styles.listings__modal_close} aria-label={intl.formatMessage({ id: 'close_modal', defaultMessage: 'Закрыть' })}>×</button>
        {showFullScreenHint && (
          <div className={styles.listings__fullscreen_hint}>
            <FormattedMessage id="tap_to_close" defaultMessage="Нажмите на экран, чтобы закрыть" />
          </div>
        )}
        <div className={styles.listings__fullscreen_image_wrapper}>
          <img
            src={selectedListing.images[currentImageIndex].image}
            alt={intl.formatMessage({ id: 'slide_alt', defaultMessage: 'Слайд {index}' }, { index: currentImageIndex + 1 })}
            className={styles.listings__fullscreen_image}
            onError={(e) => (e.target.src = 'https://via.placeholder.com/400')}
          />
        </div>
        <div className={styles.listings__thumbnail_container}>
          {selectedListing.images.map((image, index) => (
            <img
              key={index}
              src={image.image}
              alt={intl.formatMessage({ id: 'thumbnail_alt', defaultMessage: 'Миниатюра {index}' }, { index: index + 1 })}
              className={`${styles.listings__thumbnail} ${index === currentImageIndex ? styles['listings__thumbnail--active'] : ''}`}
              onClick={(e) => { e.stopPropagation(); selectImage(index); }}
              onError={(e) => (e.target.src = 'https://via.placeholder.com/100')}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderSidebar = () => {
    if (isLoading) return <p><FormattedMessage id="loading" defaultMessage="Загрузка..." /></p>;
    return (
      <>
        <img
          src={agentData.image}
          alt={intl.formatMessage({ id: 'agent_avatar_alt', defaultMessage: 'Аватар агента' })}
          className={styles.listings__modal_avatar}
          onError={(e) => (e.target.src = 'https://via.placeholder.com/100')}
        />
        <p className={styles.listings__modal_agent}>{agentData.name}</p>
        <p className={styles.listings__modal_phone}>{agentData.phone}</p>
      </>
    );
  };

  const actionButtons = [
    {
      action: () => handleLike(selectedListing?.id),
      disabled: likedListings.has(selectedListing?.id) || !selectedListing?.id,
      className: likedListings.has(selectedListing?.id) ? styles['listings__modal_action_button--liked'] : '',
      title: 'like_button',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={likedListings.has(selectedListing?.id) ? '#ef4444' : 'none'} stroke="#4b5563" strokeWidth="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ),
      label: selectedListing?.likes_count || 0,
    },
    {
      action: () => handleFavorite(selectedListing),
      disabled: !selectedListing,
      className: favorites.some((fav) => fav.id === selectedListing?.id) ? styles['listings__modal_action_button--active'] : '',
      title: 'favorite_button',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={favorites.some((fav) => fav.id === selectedListing?.id) ? '#ef4444' : 'none'} stroke="#4b5563" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
    },
    {
      action: () => handleShare(selectedListing),
      disabled: !selectedListing,
      title: 'share_button',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.70s-.04-.47-.09-.70l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.70L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
        </svg>
      ),
    },
  ];

  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains(styles.listings__modal)) {
      closeModal();
    }
  };

  return (
    <div className={styles.listings__modal} onClick={handleBackgroundClick}>
      {toast.message && (
        <div className={`${styles.listings__toast} ${styles[`listings__toast--${toast.type}`]}`}>
          {toast.message}
        </div>
      )}
      {isFullScreen && renderFullScreenSlider()}
      <div className={styles.listings__modal_content}>
        <button onClick={closeModal} className={styles.listings__modal_close} aria-label={intl.formatMessage({ id: 'close_modal', defaultMessage: 'Закрыть' })}>×</button>
        <div className={styles.listings__modal_main}>
          <h3 className={styles.listings__modal_title}>{selectedListing?.title || intl.formatMessage({ id: 'no_title', defaultMessage: 'Без названия' })}</h3>
          {renderSlider()}
          {renderDetails()}
        </div>
        <div className={styles.listings__modal_sidebar}>
          {renderSidebar()}
          <div className={styles.listings__modal_buttons}>
            {actionButtons.map(({ action, disabled, className, title, icon, label }, index) => (
              <button
                key={index}
                className={`${styles.listings__modal_action_button} ${className}`}
                onClick={action}
                disabled={disabled}
                title={intl.formatMessage({ id: title, defaultMessage: title })}
              >
                {icon}
                {label && <span>{label}</span>}
              </button>
            ))}
            <button
              onClick={handleWhatsAppClick}
              className={`${styles.listings__modal_button} ${styles['listings__modal_button--whatsapp']}`}
              disabled={!selectedListing}
            >
              <FormattedMessage id="whatsapp_button" defaultMessage="WhatsApp" />
            </button>
            <button
              onClick={toggleRequestForm}
              className={`${styles.listings__modal_button} ${styles['listings__modal_button--request']}`}
              disabled={!selectedListing}
            >
              <FormattedMessage id="request_button" defaultMessage="Оставить заявку" />
            </button>
          </div>
          {showRequestForm && (
            <div className={styles.listings__modal_form}>
              <input
                type="text"
                name="name"
                value={requestData.name}
                onChange={handleRequestChange}
                placeholder={intl.formatMessage({ id: 'name_placeholder', defaultMessage: 'Ваше имя' })}
                className={styles.listings__modal_input}
                required
              />
              <input
                type="text"
                name="contact_phone"
                value={requestData.contact_phone}
                onChange={handleRequestChange}
                placeholder={intl.formatMessage({ id: 'phone_placeholder', defaultMessage: 'Номер телефона' })}
                className={styles.listings__modal_input}
                required
              />
              <textarea
                name="message"
                value={requestData.message}
                onChange={handleRequestChange}
                placeholder={intl.formatMessage({ id: 'message_placeholder', defaultMessage: 'Ваше сообщение' })}
                className={styles.listings__modal_textarea}
                required
              />
              <button
                type="submit"
                className={styles.listings__modal_button}
                disabled={isLoading}
                onClick={handleRequestSubmitWithListing}
              >
                {isLoading ? <FormattedMessage id="sending" defaultMessage="Отправка..." /> : <FormattedMessage id="send_button" defaultMessage="Отправить" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingModal;