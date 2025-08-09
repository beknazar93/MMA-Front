import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import ListingModal from '../Listings/ListingModal';
import styles from './Favorites.module.scss';

const Favorites = ({ language = 'ru' }) => {
  const intl = useIntl();
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites') || '[]'));
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestData, setRequestData] = useState({ name: '', contact_phone: '', message: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [likedListings, setLikedListings] = useState(
    new Set(JSON.parse(localStorage.getItem('likedListings') || '[]'))
  );
  const [userId, setUserId] = useState(
    localStorage.getItem('userId') || `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const [toast, setToast] = useState({ message: '', type: '' });
  const [complexes, setComplexes] = useState([]);
  const USD_RATE = 85;

  useEffect(() => {
    const fetchComplexes = async () => {
      try {
        const response = await fetch('https://dar.kg/api/v1/listings/single-field/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          setComplexes(await response.json());
        } else {
          console.error(
            intl.formatMessage(
              { id: 'error_complexes_fetch', defaultMessage: 'Ошибка загрузки комплексов: {status}' },
              { status: response.status }
            )
          );
        }
      } catch (error) {
        console.error(
          intl.formatMessage(
            { id: 'error_complexes_fetch', defaultMessage: 'Ошибка загрузки комплексов: {status}' },
            { status: error.message }
          )
        );
      }
    };
    fetchComplexes();
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('likedListings', JSON.stringify([...likedListings]));
    localStorage.setItem('userId', userId);
  }, [favorites, likedListings, userId, intl]);

  const handleLike = async (listingId) => {
    if (likedListings.has(listingId)) return;
    try {
      const updatedFavorites = favorites
        .map((listing) =>
          listing.id === listingId ? { ...listing, likes_count: (listing.likes_count || 0) + 1 } : listing
        )
        .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      setFavorites(updatedFavorites);
      setLikedListings(new Set([...likedListings, listingId]));
      const response = await fetch(`https://dar.kg/api/v1/listings/listings/${listingId}/like/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, listingId }),
      });
      if (!response.ok) throw new Error('Server error');
      setSuccess(intl.formatMessage({ id: 'like_added', defaultMessage: 'Лайк добавлен!' }));
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      console.error(intl.formatMessage({ id: 'error_like', defaultMessage: 'Ошибка при добавлении лайка' }));
      setError(intl.formatMessage({ id: 'error_like', defaultMessage: 'Ошибка при добавлении лайка' }));
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleFavorite = (listing) => {
    setFavorites((prev) => {
      const isFavorite = prev.some((item) => item.id === listing.id);
      if (isFavorite) {
        setSuccess(intl.formatMessage({ id: 'removed_from_favorites', defaultMessage: 'Удалено из избранного!' }));
        setTimeout(() => setSuccess(''), 2000);
        return prev.filter((item) => item.id !== listing.id);
      } else {
        setSuccess(intl.formatMessage({ id: 'added_to_favorites', defaultMessage: 'Добавлено в избранное!' }));
        setTimeout(() => setSuccess(''), 2000);
        return [...prev, listing];
      }
    });
  };

  const handleShare = (listing) => {
    const shareUrl = `${window.location.origin}/listing/${listing.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setToast({
        message: intl.formatMessage({ id: 'link_copied', defaultMessage: 'Ссылка скопирована!' }),
        type: 'success',
      });
      setTimeout(() => setToast({ message: '', type: '' }), 2000);
    }).catch(() => {
      setError(intl.formatMessage({ id: 'error_copy_link', defaultMessage: 'Ошибка копирования ссылки' }));
      setTimeout(() => setError(''), 2000);
    });
  };

  const handleWhatsApp = (listing) => {
    const message = intl.formatMessage(
      { id: 'whatsapp_message', defaultMessage: 'Здравствуйте! Интересует объявление: "{title}" ({city}, {district})' },
      {
        title: listing.title || intl.formatMessage({ id: 'no_title', defaultMessage: 'Без названия' }),
        city: listing.location?.city || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указан' }),
        district: listing.location?.district || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указан' }),
      }
    );
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openModal = (listing) => {
    setSelectedListing(listing);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
    setShowRequestForm(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
    setRequestData({ name: '', contact_phone: '', message: '' });
    setShowRequestForm(false);
    setSuccess('');
    setError('');
  };

  const handleRequestChange = (e) => {
    setRequestData({ ...requestData, [e.target.name]: e.target.value });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const messageWithDetails = `${requestData.message}\n${intl.formatMessage({ id: 'listing', defaultMessage: 'Объявление' })}: ${
        selectedListing.title
      }\n${intl.formatMessage({ id: 'price', defaultMessage: 'Цена' })}: ${
        selectedListing.deal_type === 'elite'
          ? `${parseFloat(selectedListing.price || 0).toLocaleString('ru-RU')} ${intl.formatMessage({ id: 'som', defaultMessage: 'сом' })} / ${parseFloat((selectedListing.price || 0) / USD_RATE).toFixed(2)} $`
          : `${parseFloat(selectedListing.price || 0).toLocaleString('ru-RU')} ${intl.formatMessage({ id: 'som', defaultMessage: 'сом' })} / ${parseFloat((selectedListing.price || 0) / USD_RATE).toFixed(2)} $`
      }`;
      const response = await fetch('https://dar.kg/api/v1/listings/applications/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: requestData.name,
          contact_phone: requestData.contact_phone,
          message: messageWithDetails,
        }),
      });
      if (!response.ok) throw new Error('Server error');
      setSuccess(intl.formatMessage({ id: 'request_sent', defaultMessage: 'Заявка отправлена!' }));
      setTimeout(closeModal, 1000);
    } catch (error) {
      console.error(intl.formatMessage({ id: 'error_submit_request', defaultMessage: 'Ошибка при отправке заявки' }));
      setError(intl.formatMessage({ id: 'error_submit_request', defaultMessage: 'Ошибка при отправке заявки' }));
      setTimeout(() => setError(''), 2000);
    }
  };

  const toggleRequestForm = () => {
    setShowRequestForm(!showRequestForm);
  };

  const formatPropertyType = (type) => {
    return intl.formatMessage({
      id: `property_${type}` || 'property_default',
      defaultMessage: {
        apartment: 'Квартира',
        house: 'Дом/Участок',
        commercial: 'Коммерческая',
        default: 'Не указан',
      }[type] || 'Не указан',
    });
  };

  const formatDealType = (type) => {
    return intl.formatMessage({
      id: `deal_type_${type}` || 'deal_type_default',
      defaultMessage: {
        elite: 'Элитка',
        new_building: 'Новостройки',
        default: 'Не указан',
      }[type] || 'Не указан',
    });
  };

  const formatCondition = (condition) => {
    return intl.formatMessage({
      id: `condition_${condition}` || 'condition_default',
      defaultMessage: {
        renovated: 'С ремонтом',
        no_renovation: 'Без ремонта',
        pso: 'Сдан ПСО',
        euro_remont: 'Евроремонт',
        default: 'Не указан',
      }[condition] || 'Не указан',
    });
  };

  const formatDocument = (document) => {
    return intl.formatMessage({
      id: `document_${document}` || 'document_default',
      defaultMessage: {
        general_power_of_attorney: 'Генеральная доверенность',
        gift_agreement: 'Договор дарения',
        equity_participation_agreement: 'Договор долевого участия',
        sale_purchase_agreement: 'Договор купли-продажи',
        red_book: 'Красная книга',
        technical_passport: 'Техпаспорт',
        default: 'Не указан',
      }[document] || 'Не указан',
    });
  };

  const formatComplex = (complexId) => {
    const complex = complexes.find((c) => c.id === complexId);
    return complex ? complex.value : intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указан' });
  };

  const formatUtilities = (type) => {
    return intl.formatMessage({
      id: `utilities_${type}` || 'utilities_default',
      defaultMessage: {
        all: 'Все подключены',
        partial: 'Частично',
        none: 'Отсутствуют',
        default: 'Не указан',
      }[type] || 'Не указан',
    });
  };

  const formatPurpose = (type) => {
    return intl.formatMessage({
      id: `purpose_${type}` || 'purpose_default',
      defaultMessage: {
        cafe: 'Кафе/ресторан',
        shop: 'Магазин',
        office: 'Офис',
        default: 'Не указан',
      }[type] || 'Не указан',
    });
  };

  const formatCommercialType = (type) => {
    return intl.formatMessage({
      id: `commercial_type_${type}` || 'commercial_type_default',
      defaultMessage: {
        office: 'Офис',
        retail: 'Торговая площадь',
        warehouse: 'Склад',
        other: 'Прочее',
        default: 'Не указан',
      }[type] || 'Не указан',
    });
  };

  return (
    <section className={styles.favorites}>
      <h2 className={styles.favorites__title}>
        {intl.formatMessage({ id: 'favorites', defaultMessage: 'Избранное' })}
      </h2>
      {error && <p className={styles.favorites__error}>{error}</p>}
      {success && <p className={styles.favorites__success}>{success}</p>}
      {toast.message && (
        <div className={`${styles.favorites__toast} ${styles[`favorites__toast--${toast.type}`]}`}>
          {toast.message}
        </div>
      )}
      {favorites.length === 0 ? (
        <p className={styles.favorites__empty}>
          {intl.formatMessage({ id: 'no_favorites', defaultMessage: 'Избранные объявления отсутствуют' })}
        </p>
      ) : (
        <div className={styles.favorites__grid}>
          {favorites.map((item) => (
            <article key={item.id} className={styles.favorites__card}>
              {item.images?.length > 0 && item.images[0]?.image ? (
                <img
                  src={item.images[0].image}
                  alt={intl.formatMessage(
                    { id: 'property_image_alt', defaultMessage: 'Изображение недвижимости' },
                    { title: item.title || intl.formatMessage({ id: 'no_title', defaultMessage: 'Без названия' }) }
                  )}
                  className={styles.favorites__image}
                  loading="lazy"
                  onError={(e) => (e.target.src = '/path/to/fallback-image.png')}
                />
              ) : (
                <div className={styles.favorites__no_image}>
                  {intl.formatMessage({ id: 'no_images', defaultMessage: 'Изображения отсутствуют' })}
                </div>
              )}
              <div className={styles.favorites__content}>
                <h3 className={styles.favorites__cardTitle} onClick={() => openModal(item)}>
                  {item.title || intl.formatMessage({ id: 'no_title', defaultMessage: 'Без названия' })}
                </h3>
                <p className={styles.favorites__address}>
                  {item.location?.city || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указан' })},{' '}
                  {item.location?.district || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указан' })}
                </p>
                <p className={styles.favorites__price}>
                  {item.deal_type === 'elite'
                    ? `${parseFloat(item.price || 0).toLocaleString('ru-RU')} ${intl.formatMessage({ id: 'som', defaultMessage: 'сом' })} / ${parseFloat((item.price || 0) / USD_RATE).toFixed(2)} $`
                    : `${parseFloat(item.price || 0).toLocaleString('ru-RU')} ${intl.formatMessage({ id: 'som', defaultMessage: 'сом' })} / ${parseFloat((item.price || 0) / USD_RATE).toFixed(2)} $`}
                </p>
                <div className={styles.favorites__details}>
                  <span>
                    {item.rooms || 'N/A'} {intl.formatMessage({ id: 'rooms_short', defaultMessage: 'комн.' })}
                  </span>
                  <span>
                    {item.area || 'N/A'} {intl.formatMessage({ id: 'square_meters', defaultMessage: 'м²' })}
                  </span>
                  {item.floor && (
                    <span>
                      {intl.formatMessage({ id: 'floor', defaultMessage: 'Этаж' })}: {item.floor}
                    </span>
                  )}
                  {item.land_area && (
                    <span>
                      {item.land_area} {intl.formatMessage({ id: 'sotka', defaultMessage: 'соток' })}
                    </span>
                  )}
                  {item.commercial_type && <span>{formatCommercialType(item.commercial_type)}</span>}
                  <span>{formatPropertyType(item.property_type)}</span>
                </div>
                <div className={styles.favorites__actions}>
                  <button
                    className={`${styles.favorites__action_button} ${
                      likedListings.has(item.id) ? styles['favorites__action_button--liked'] : ''
                    }`}
                    onClick={() => handleLike(item.id)}
                    disabled={likedListings.has(item.id)}
                    title={intl.formatMessage({ id: 'like_button', defaultMessage: 'Лайк' })}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={likedListings.has(item.id) ? '#ef4444' : 'none'}
                      stroke={likedListings.has(item.id) ? '#ef4444' : '#4b5563'}
                      strokeWidth="2"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span>{item.likes_count || 0}</span>
                  </button>
                  <button
                    className={`${styles.favorites__action_button} ${
                      favorites.some((fav) => fav.id === item.id) ? styles['favorites__action_button--active'] : ''
                    }`}
                    onClick={() => handleFavorite(item)}
                    title={intl.formatMessage({ id: 'favorite_button', defaultMessage: 'Избранное' })}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={favorites.some((fav) => fav.id === item.id) ? '#ef4444' : 'none'}
                      stroke={favorites.some((fav) => fav.id === item.id) ? '#ef4444' : '#4b5563'}
                      strokeWidth="2"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                  <button
                    className={styles.favorites__action_button}
                    onClick={() => handleShare(item)}
                    title={intl.formatMessage({ id: 'share_button', defaultMessage: 'Поделиться' })}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4b5563"
                      strokeWidth="2"
                    >
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.70s-.04-.47-.09-.70l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.70L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                    </svg>
                  </button>
                  <button className={styles.favorites__button} onClick={() => openModal(item)}>
                    {intl.formatMessage({ id: 'details_button', defaultMessage: 'Подробнее' })}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {isModalOpen && selectedListing && (
        <ListingModal
          selectedListing={selectedListing}
          closeModal={closeModal}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          showRequestForm={showRequestForm}
          toggleRequestForm={toggleRequestForm}
          requestData={requestData}
          handleRequestChange={handleRequestChange}
          handleRequestSubmit={handleRequestSubmit}
          handleLike={handleLike}
          handleFavorite={handleFavorite}
          handleShare={handleShare}
          handleWhatsApp={handleWhatsApp}
          likedListings={likedListings}
          favorites={favorites}
          formatPropertyType={formatPropertyType}
          formatDealType={formatDealType}
          formatCondition={formatCondition}
          formatDocument={formatDocument}
          formatComplex={formatComplex}
          formatUtilities={formatUtilities}
          formatPurpose={formatPurpose}
          formatCommercialType={formatCommercialType}
          language={language}
        />
      )}
    </section>
  );
};

export default Favorites;