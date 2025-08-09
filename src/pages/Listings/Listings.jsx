import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import axios from 'axios';
import ListingModal from './ListingModal';
import EditListingModal from '../../Components/EditListing/EditListing';
import styles from './Listings.module.scss';

const Listings = ({ searchParams, selectedListingId }) => {
  const intl = useIntl();
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [requestData, setRequestData] = useState({ name: '', contact_phone: '', message: '' });
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likedListings, setLikedListings] = useState(
    new Set(JSON.parse(localStorage.getItem('likedListings') || '[]'))
  );
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites') || '[]'));
  const [toast, setToast] = useState({ message: '', type: '' });
  const [userId] = useState(
    localStorage.getItem('userId') || `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const [userRole, setUserRole] = useState('');
  const [complexes, setComplexes] = useState([]);
  const listingsPerPage = 10;
  const USD_RATE = 85;

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error(intl.formatMessage({ id: 'error_no_refresh_token', defaultMessage: 'Нет токена обновления' }));
    const response = await axios.post('https://dar.kg/api/v1/users/auth/token/refresh/', { refresh });
    localStorage.setItem('access_token', response.data.access);
    return response.data.access;
  };

  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('access_token');
    const headers = { ...options.headers, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    try {
      if (!token) {
        token = await refreshToken();
        headers.Authorization = `Bearer ${token}`;
      }
      return await axios({ url, ...options, headers });
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          token = await refreshToken();
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

  const showToast = (messageId, type) => {
    setToast({ message: intl.formatMessage({ id: messageId, defaultMessage: messageId }), type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const fetchProfile = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      setUserRole('');
      return;
    }
    try {
      const response = await fetchWithAuth('https://dar.kg/api/v1/users/me/', {});
      if (response.ok !== false) {
        setUserRole(response.data.role || '');
      } else {
        showToast('error_fetch_profile', 'error');
      }
    } catch (error) {
      console.error('Ошибка fetchProfile:', error);
      showToast('error_fetch_profile', 'error');
    }
  };

  const fetchListings = async () => {
    try {
      const query = new URLSearchParams(searchParams).toString();
      const response = await axios.get(`https://dar.kg/api/v1/listings/listings/?${query}`);
      const sortedListings = Array.isArray(response.data) ? response.data : response.data.results || [];
      setListings(sortedListings.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)));
    } catch (error) {
      console.error('Ошибка fetchListings:', error);
      showToast('error_fetch_listings', 'error');
    }
  };

  const fetchComplexes = async () => {
    try {
      const response = await axios.get('https://dar.kg/api/v1/listings/single-field/');
      setComplexes(response.data);
    } catch (error) {
      console.error('Ошибка fetchComplexes:', error);
      showToast('error_fetch_complexes', 'error');
    }
  };

  const fetchListingById = async (id) => {
    try {
      const response = await axios.get(`https://dar.kg/api/v1/listings/listings/${id}/`);
      setSelectedListing(response.data);
      setIsModalOpen(true);
      setCurrentImageIndex(0);
    } catch (error) {
      console.error('Ошибка fetchListingById:', error);
      showToast('error_fetch_listing', 'error');
    }
  };

  const handleDelete = async (listingId, event) => {
    event.stopPropagation();
    try {
      const response = await fetchWithAuth(`https://dar.kg/api/v1/listings/listings/${listingId}/`, { method: 'DELETE' });
      if (response.ok !== false || response.status === 204) {
        setListings(listings.filter(l => l.id !== listingId));
        showToast('listing_deleted', 'success');
      } else {
        showToast(`error_delete_${response.status}`, 'error');
      }
    } catch (err) {
      console.error('Ошибка handleDelete:', err);
      showToast('error_delete', 'error');
    }
  };

  const handleEdit = (listing, event) => {
    event.stopPropagation();
    setSelectedListing(listing);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedListing(null);
    fetchListings();
  };

  useEffect(() => {
    fetchProfile();
    fetchListings();
    fetchComplexes();
    if (selectedListingId) fetchListingById(selectedListingId);
  }, [searchParams, selectedListingId]);

  useEffect(() => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('likedListings', JSON.stringify([...likedListings]));
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [userId, likedListings, favorites]);

  const handleLike = async (listingId, event) => {
    event.stopPropagation();
    if (likedListings.has(listingId)) return;

    try {
      setListings((prev) =>
        prev
          .map((listing) =>
            listing.id === listingId
              ? { ...listing, likes_count: (listing.likes_count || 0) + 1 }
              : listing
          )
          .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
      );
      setLikedListings(new Set([...likedListings, listingId]));
      await axios.post(`https://dar.kg/api/v1/listings/listings/${listingId}/like/`, { userId, listingId });
      showToast('like_added', 'success');
    } catch (error) {
      console.error('Ошибка handleLike:', error);
      showToast('error_like', 'error');
    }
  };

  const handleFavorite = (listing, event) => {
    event.stopPropagation();
    setFavorites((prev) => {
      const isFavorite = prev.some((item) => item.id === listing.id);
      showToast(isFavorite ? 'removed_from_favorites' : 'added_to_favorites', 'success');
      return isFavorite
        ? prev.filter((item) => item.id !== listing.id)
        : [...prev, listing];
    });
  };

  const handleShare = (listing, event) => {
    event.stopPropagation();
    const shareUrl = `${window.location.origin}/listing/${listing.id}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => showToast('link_copied', 'success'))
      .catch((error) => {
        console.error('Ошибка копирования ссылки:', error);
        showToast('error_copy', 'error');
      });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const openModal = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
    setCurrentImageIndex(0);
    setShowRequestForm(false);
    window.history.pushState({}, '', `/listing/${listing.id}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
    setRequestData({ name: '', contact_phone: '', message: '' });
    setShowRequestForm(false);
    window.history.pushState({}, '', '/');
  };

  const handleRequestChange = (e) => {
    setRequestData({ ...requestData, [e.target.name]: e.target.value });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const messageWithDetails = `${requestData.message}\n${intl.formatMessage({ id: 'listing', defaultMessage: 'Объявление' })}: ${
        selectedListing.title || intl.formatMessage({ id: 'no_title', defaultMessage: 'Без названия' })
      }\n${intl.formatMessage({ id: 'price', defaultMessage: 'Цена' })}: $${parseFloat(
        selectedListing.price || 0
      ).toFixed(2)} / ${(selectedListing.price * USD_RATE || 0).toLocaleString('ru-RU')} ${intl.formatMessage({ id: 'som', defaultMessage: 'сом' })}`;
      await axios.post('https://dar.kg/api/v1/listings/applications/', {
        name: requestData.name,
        contact_phone: requestData.contact_phone,
        message: messageWithDetails,
      });
      showToast('request_sent', 'success');
      setTimeout(closeModal, 1000);
    } catch (error) {
      console.error('Ошибка handleRequestSubmit:', error);
      showToast('error_submit_request', 'error');
    }
  };

  const handleWhatsApp = (listing) => {
    const message = intl.formatMessage(
      { id: 'whatsapp_message', defaultMessage: 'Здравствуйте, интересуюсь объявлением: {title}, {city}, {district}' },
      {
        title: listing.title || intl.formatMessage({ id: 'no_title', defaultMessage: 'Без названия' }),
        city: listing.location?.city || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' }),
        district: listing.location?.district || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' }),
      }
    );
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const toggleRequestForm = () => {
    setShowRequestForm((prev) => !prev);
  };

  const formatters = {
    propertyType: (type) => intl.formatMessage({ id: `property_${type || 'default'}`, defaultMessage: type || 'Не указано' }),
    dealType: (type) => intl.formatMessage({ id: `deal_type_${type || 'default'}`, defaultMessage: type || 'Не указано' }),
    condition: (type) => intl.formatMessage({ id: `condition_${type || 'default'}`, defaultMessage: type || 'Не указано' }),
    document: (type) => intl.formatMessage({ id: `document_${type || 'default'}`, defaultMessage: type || 'Не указано' }),
    complex: (complexId) => {
      const complex = complexes.find((c) => c.id === complexId);
      return complex ? complex.value : intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' });
    },
    utilities: (type) => intl.formatMessage({ id: `utilities_${type || 'default'}`, defaultMessage: type || 'Не указано' }),
    purpose: (type) => intl.formatMessage({ id: `purpose_${type || 'default'}`, defaultMessage: type || 'Не указано' }),
    commercialType: (type) => intl.formatMessage({ id: `commercial_type_${type || 'default'}`, defaultMessage: type || 'Не указано' }),
  };

  const paginatedListings = listings.slice((page - 1) * listingsPerPage, page * listingsPerPage);
  const totalPages = Math.ceil(listings.length / listingsPerPage);

  const renderCard = (item, index) => {
    if (!item) {
      return (
        <article key={`empty-${index}`} className={styles.listings__card_empty}>
          <div className={styles.listings__no_image}>
            <FormattedMessage id="no_listing" defaultMessage="Объявление отсутствует" />
          </div>
          <div className={styles.listings__content_empty}>
            <h3 className={styles.listings__cardTitle_empty}>
              <FormattedMessage id="no_data" defaultMessage="Нет данных" />
            </h3>
            <p className={styles.listings__address_empty}>—</p>
            <p className={styles.listings__price_empty}>—</p>
            <div className={styles.listings__details_empty}>
              <span>—</span>
              <span>—</span>
              <span>—</span>
            </div>
          </div>
        </article>
      );
    }

    const actionButtons = [
      {
        action: (e) => handleLike(item.id, e),
        disabled: likedListings.has(item.id),
        className: likedListings.has(item.id) ? styles['listings__action_button--liked'] : '',
        title: 'like_button',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill={likedListings.has(item.id) ? '#ef4444' : 'none'} stroke={likedListings.has(item.id) ? '#ef4444' : '#4b5563'} strokeWidth="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ),
        label: item.likes_count || 0,
      },
      {
        action: (e) => handleFavorite(item, e),
        disabled: false,
        className: favorites.some((fav) => fav.id === item.id) ? styles['listings__action_button--active'] : '',
        title: 'favorite_button',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill={favorites.some((fav) => fav.id === item.id) ? '#ef4444' : 'none'} stroke={favorites.some((fav) => fav.id === item.id) ? '#ef4444' : '#4b5563'} strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ),
      },
      {
        action: (e) => handleShare(item, e),
        disabled: false,
        title: 'share_button',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.70s-.04-.47-.09-.70l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.70L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
          </svg>
        ),
      },
    ];

    if (userRole === 'admin') {
      actionButtons.push(
        {
          action: (e) => handleEdit(item, e),
          disabled: false,
          className: '',
          title: 'edit_button',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          ),
        },
        {
          action: (e) => handleDelete(item.id, e),
          disabled: false,
          className: '',
          title: 'delete_button',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-1 5v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-7m-4-3h18" />
            </svg>
          ),
        }
      );
    }

    return (
      <article key={item.id} className={styles.listings__card} onClick={() => openModal(item)} style={{ cursor: 'pointer' }}>
        {item.images?.length > 0 && item.images[0]?.image ? (
          <img
            src={item.images[0].image}
            alt={item.title || intl.formatMessage({ id: 'property_image_alt', defaultMessage: 'Изображение недвижимости' })}
            className={styles.listings__image}
            loading="lazy"
            onError={(e) => (e.target.src = 'https://via.placeholder.com/400')}
          />
        ) : (
          <div className={styles.listings__no_image}>
            <FormattedMessage id="no_images" defaultMessage="Изображения отсутствуют" />
          </div>
        )}
        <div className={styles.listings__content}>
          <h3 className={styles.listings__cardTitle}>{item.title || intl.formatMessage({ id: 'no_title', defaultMessage: 'Без названия' })}</h3>
          <p className={styles.listings__address}>
            {item.location?.city || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' })},{' '}
            {item.location?.district || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' })}
          </p>
          <p className={styles.listings__price}>
            <span className={styles.dollar}>
              ${parseFloat(item.price || 0).toFixed(2)} / {(item.price * USD_RATE || 0).toLocaleString('ru-RU')}{' '}
              <FormattedMessage id="som" defaultMessage="сом" />
            </span>
          </p>
          <div className={styles.listings__details}>
            {item.rooms && <span>{item.rooms} <FormattedMessage id="rooms_short" defaultMessage="комн." /></span>}
            {item.area && <span>{item.area} <FormattedMessage id="square_meters" defaultMessage="м²" /></span>}
            {item.floor && <span><FormattedMessage id="floor" defaultMessage="Этаж" />: {item.floor}</span>}
            {item.land_area && <span>{item.land_area} <FormattedMessage id="sotka" defaultMessage="соток" /></span>}
            {item.commercial_type && <span>{formatters.commercialType(item.commercial_type)}</span>}
            <span>{formatters.propertyType(item.property_type)}</span>
          </div>
          <div className={styles.listings__actions}>
            {actionButtons.map(({ action, disabled, className, title, icon, label }, idx) => (
              <button
                key={idx}
                className={`${styles.listings__action_button} ${className}`}
                onClick={action}
                disabled={disabled}
                title={intl.formatMessage({ id: title, defaultMessage: title })}
              >
                {icon}
                {label && <span>{label}</span>}
              </button>
            ))}
          </div>
        </div>
      </article>
    );
  };

  return (
    <section id="listings" className={styles.listings}>
      <div className={styles.listings__header}>
        <h2 className={styles.listings__title}>
          <FormattedMessage id="listings_title" defaultMessage="Объявления" />
        </h2>
      </div>
      {toast.message && (
        <div className={`${styles.listings__toast} ${styles[`listings__toast--${toast.type}`]}`}>
          {toast.message}
        </div>
      )}
      {listings.length === 0 ? (
        <p className={styles.listings__empty}>
          <FormattedMessage id="no_listings" defaultMessage="Объявления не найдены" />
        </p>
      ) : (
        <>
          <div className={styles.listings__grid}>
            {Array(10)
              .fill(null)
              .map((_, index) => renderCard(paginatedListings[index], index))}
          </div>
          {totalPages > 1 && (
            <div className={styles.listings__pagination}>
              <button
                className={styles.listings__paginationButton}
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                aria-label={intl.formatMessage({ id: 'prev_page', defaultMessage: 'Предыдущая страница' })}
              >
                ←
              </button>
              <span className={styles.listings__paginationText}>
                {page} <FormattedMessage id="of" defaultMessage="из" /> {totalPages}
              </span>
              <button
                className={styles.listings__paginationButton}
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                aria-label={intl.formatMessage({ id: 'next_page', defaultMessage: 'Следующая страница' })}
              >
                →
              </button>
            </div>
          )}
        </>
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
          formatPropertyType={formatters.propertyType}
          formatDealType={formatters.dealType}
          formatCondition={formatters.condition}
          formatDocument={formatters.document}
          formatComplex={formatters.complex}
          formatUtilities={formatters.utilities}
          formatPurpose={formatters.purpose}
          formatCommercialType={formatters.commercialType}
        />
      )}
      {isEditModalOpen && selectedListing && (
        <EditListingModal
          listing={selectedListing}
          closeModal={closeEditModal}
          fetchListings={fetchListings}
          complexes={complexes}
        />
      )}
    </section>
  );
};

export default Listings;