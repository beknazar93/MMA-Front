import React, { useState, useEffect } from "react";
import { FormattedMessage, useIntl } from 'react-intl';
import ListingModal from "../../pages/Listings/ListingModal";
import EditListingModal from "../EditListing/EditListing"; // Импортируем исправленный компонент редактирования
import styles from "../../pages/Listings/Listings.module.scss";

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [requestData, setRequestData] = useState({
    name: "",
    contact_phone: "",
    message: "",
  });
  const [success, setSuccess] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [likedListings, setLikedListings] = useState(
    new Set(JSON.parse(localStorage.getItem("likedListings") || "[]"))
  );
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );
  const [toast, setToast] = useState({ message: "", type: "" });
  const [userId, setUserId] = useState(null);
  const [complexes, setComplexes] = useState([]);
  const listingsPerPage = 10;
  const USD_RATE = 85;
  const intl = useIntl();

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('Нет refresh токена');
    const response = await fetch('https://dar.kg/api/v1/users/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw new Error('Ошибка обновления токена');
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('access_token');
    if (!token) token = await refreshToken();
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      token = await refreshToken();
      headers.Authorization = `Bearer ${token}`;
      return await fetch(url, { ...options, headers });
    }
    return response;
  };

  const fetchProfile = async () => {
    try {
      const response = await fetchWithAuth('https://dar.kg/api/v1/users/me/');
      if (response.ok) {
        const data = await response.json();
        setUserId(data.id);
      } else {
        setToast({ message: intl.formatMessage({ id: 'error_fetch_profile', defaultMessage: 'Ошибка загрузки профиля' }), type: "error" });
        setTimeout(() => setToast({ message: "", type: "" }), 3000);
      }
    } catch (error) {
      console.error("Ошибка fetchProfile:", error);
      setToast({ message: intl.formatMessage({ id: 'error_fetch_profile', defaultMessage: 'Ошибка загрузки профиля' }), type: "error" });
      setTimeout(() => setToast({ message: "", type: "" }), 3000);
    }
  };

  const fetchListings = async () => {
    try {
      const response = await fetch('https://dar.kg/api/v1/listings/listings/?is_active=true');
      if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);
      const data = await response.json();
      const sortedListings = Array.isArray(data) ? data : data.results || [];
      if (userId) {
        const filteredListings = sortedListings.filter(listing => listing.owner?.id === userId);
        setListings(filteredListings.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)));
      }
    } catch (error) {
      console.error("Ошибка fetchListings:", error);
      setToast({ message: intl.formatMessage({ id: 'error_fetch_listings', defaultMessage: 'Ошибка загрузки объявлений' }), type: "error" });
      setTimeout(() => setToast({ message: "", type: "" }), 3000);
    }
  };

  const fetchComplexes = async () => {
    try {
      const response = await fetch(
        "https://dar.kg/api/v1/listings/single-field/",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) setComplexes(await response.json());
      else console.error("Ошибка fetchComplexes:", response.status);
    } catch (error) {
      console.error("Ошибка fetchComplexes:", error);
      setToast({ message: intl.formatMessage({ id: 'error_fetch_complexes', defaultMessage: 'Ошибка загрузки комплексов' }), type: "error" });
      setTimeout(() => setToast({ message: "", type: "" }), 3000);
    }
  };

  const handleDelete = async (listingId, event) => {
    event.stopPropagation();
    try {
      const response = await fetchWithAuth(`https://dar.kg/api/v1/listings/listings/${listingId}/`, {
        method: 'DELETE',
      });
      if (response.ok || response.status === 204) {
        setListings(listings.filter(l => l.id !== listingId));
        setToast({ message: intl.formatMessage({ id: 'listing_deleted', defaultMessage: 'Объявление удалено' }), type: "success" });
      } else {
        const errorData = await response.json();
        setToast({ message: `Ошибка удаления: ${errorData.detail || response.status}`, type: "error" });
      }
    } catch (err) {
      console.error('Ошибка handleDelete:', err);
      setToast({ message: `Ошибка: ${err.message}`, type: "error" });
    }
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleEdit = (listing, event) => {
    event.stopPropagation();
    setSelectedListing(listing);
    setIsEditModalOpen(true); // Открываем модальное окно редактирования сразу
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchListings();
      fetchComplexes();
    }
  }, [userId]);

  useEffect(() => {
    localStorage.setItem("likedListings", JSON.stringify([...likedListings]));
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [likedListings, favorites]);

  const handleLike = async (listingId, event) => {
    event.stopPropagation();
    if (likedListings.has(listingId)) return;
    try {
      const updatedListings = listings
        .map((listing) =>
          listing.id === listingId
            ? { ...listing, likes_count: (listing.likes_count || 0) + 1 }
            : listing
        )
        .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      setListings(updatedListings);
      setLikedListings(new Set([...likedListings, listingId]));
      const response = await fetch(
        `https://dar.kg/api/v1/listings/listings/${listingId}/like/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, listingId }),
        }
      );
      if (!response.ok) throw new Error("Ошибка сервера");
      setSuccess(intl.formatMessage({ id: 'like_added', defaultMessage: 'Лайк добавлен' }));
      setTimeout(() => setSuccess(""), 2000);
    } catch (error) {
      console.error("Ошибка handleLike:", error);
      setSuccess(intl.formatMessage({ id: 'error_like', defaultMessage: 'Ошибка добавления лайка' }));
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  const handleFavorite = (listing, event) => {
    event.stopPropagation();
    setFavorites((prev) => {
      const isFavorite = prev.some((item) => item.id === listing.id);
      if (isFavorite) {
        setSuccess(intl.formatMessage({ id: 'removed_from_favorites', defaultMessage: 'Удалено из избранного' }));
        setTimeout(() => setSuccess(""), 2000);
        return prev.filter((item) => item.id !== listing.id);
      } else {
        setSuccess(intl.formatMessage({ id: 'added_to_favorites', defaultMessage: 'Добавлено в избранное' }));
        setTimeout(() => setSuccess(""), 2000);
        return [...prev, listing];
      }
    });
  };

  const handleShare = (listing, event) => {
    event.stopPropagation();
    const shareUrl = `${window.location.origin}/listing/${listing.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setToast({ message: intl.formatMessage({ id: 'link_copied', defaultMessage: 'Ссылка скопирована' }), type: "success" });
      setTimeout(() => setToast({ message: "", type: "" }), 2000);
    }).catch((error) => {
      console.error("Ошибка копирования ссылки:", error);
      setToast({ message: intl.formatMessage({ id: 'error_copy', defaultMessage: 'Ошибка копирования ссылки' }), type: "error" });
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
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
    setRequestData({ name: "", contact_phone: "", message: "" });
    setShowRequestForm(false);
    setSuccess("");
    window.history.pushState({}, '', '/');
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedListing(null);
    fetchListings(); // Обновляем список после закрытия
  };

  const handleRequestChange = (e) => {
    setRequestData({ ...requestData, [e.target.name]: e.target.value });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const messageWithDetails = `${requestData.message}\n${intl.formatMessage({ id: 'listing', defaultMessage: 'Объявление' })}: ${
        selectedListing.title
      }\n${intl.formatMessage({ id: 'price', defaultMessage: 'Цена' })}: $${parseFloat(
        selectedListing.price || 0
      ).toFixed(2)} / ${parseFloat((selectedListing.price || 0) * USD_RATE).toLocaleString('ru-RU')} ${intl.formatMessage({ id: 'som', defaultMessage: 'сом' })}`;
      await fetch("https://dar.kg/api/v1/listings/applications/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: requestData.name,
          contact_phone: requestData.contact_phone,
          message: messageWithDetails,
        }),
      });
      setSuccess(intl.formatMessage({ id: 'request_sent', defaultMessage: 'Заявка отправлена' }));
      setTimeout(closeModal, 1000);
    } catch (error) {
      console.error("Ошибка handleRequestSubmit:", error);
      setSuccess(intl.formatMessage({ id: 'error_submit_request', defaultMessage: 'Ошибка отправки заявки' }));
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  const handleWhatsApp = (listing) => {
    const message = intl.formatMessage(
      { id: 'whatsapp_message', defaultMessage: 'Интересует объявление: {title}, {city}, {district}' },
      { 
        title: listing.title || intl.formatMessage({ id: 'no_title', defaultMessage: 'Без названия' }), 
        city: listing.location?.city || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' }), 
        district: listing.location?.district || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' }) 
      }
    );
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const toggleRequestForm = () => {
    setShowRequestForm(!showRequestForm);
  };

  const paginatedListings = listings.slice(
    (page - 1) * listingsPerPage,
    page * listingsPerPage
  );
  const totalPages = Math.ceil(listings.length / listingsPerPage);
  const displayListings = Array(10)
    .fill(null)
    .map((_, index) => paginatedListings[index] || null);

  const formatPropertyType = (type) => {
    return intl.formatMessage({ id: `property_${type || 'default'}`, defaultMessage: type || 'Не указано' });
  };

  const formatDealType = (type) => {
    return intl.formatMessage({ id: `deal_type_${type || 'default'}`, defaultMessage: type || 'Не указано' });
  };

  const formatCondition = (condition) => {
    return intl.formatMessage({ id: `condition_${condition || 'default'}`, defaultMessage: condition || 'Не указано' });
  };

  const formatDocument = (document) => {
    return intl.formatMessage({ id: `document_${document || 'default'}`, defaultMessage: document || 'Не указано' });
  };

  const formatComplex = (complexId) => {
    const complex = complexes.find((c) => c.id === complexId);
    return complex ? complex.value : intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' });
  };

  const formatUtilities = (type) => {
    return intl.formatMessage({ id: `utilities_${type || 'default'}`, defaultMessage: type || 'Не указано' });
  };

  const formatPurpose = (type) => {
    return intl.formatMessage({ id: `purpose_${type || 'default'}`, defaultMessage: type || 'Не указано' });
  };

  const formatCommercialType = (type) => {
    return intl.formatMessage({ id: `commercial_type_${type || 'default'}`, defaultMessage: type || 'Не указано' });
  };

  return (
    <section id="my-listings" className={styles.listings}>
      <div className={styles.listings__header}>
        <h2 className={styles.listings__title}>
          <FormattedMessage id="my_listings_title" defaultMessage="Мои объявления" />
          {listings.length > 0 && ` (${listings.length})`}
        </h2>
      </div>
      {success && <p className={styles.listings__success}>{success}</p>}
      {toast.message && (
        <div
          className={`${styles.listings__toast} ${
            styles[`listings__toast--${toast.type}`]
          }`}
        >
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
            {displayListings.map((item, index) =>
              item ? (
                <article
                  key={item.id}
                  className={styles.listings__card}
                  onClick={() => openModal(item)}
                  style={{ cursor: 'pointer' }}
                >
                  {item.images?.length > 0 && item.images[0]?.image ? (
                    <img
                      src={item.images[0].image}
                      alt={item.title || intl.formatMessage({ id: 'property_image_alt', defaultMessage: 'Изображение недвижимости' })}
                      className={styles.listings__image}
                      loading="lazy"
                      onError={(e) =>
                        (e.target.src = "/path/to/fallback-image.png")
                      }
                    />
                  ) : (
                    <div className={styles.listings__no_image}>
                      <FormattedMessage id="no_images" defaultMessage="Изображения отсутствуют" />
                    </div>
                  )}
                  <div className={styles.listings__content}>
                    <h3 className={styles.listings__cardTitle}>
                      {item.title || intl.formatMessage({ id: 'no_title', defaultMessage: 'Без названия' })}
                    </h3>
                    <p className={styles.listings__address}>
                      {item.location?.city || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' })},{" "}
                      {item.location?.district || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' })}
                    </p>
                    <p className={styles.listings__price}>
                      <span className={styles.dollar}>
                        ${parseFloat(item.price || 0).toFixed(2)} / {parseFloat((item.price || 0) * USD_RATE).toLocaleString('ru-RU')} <FormattedMessage id="som" defaultMessage="сом" />
                      </span>
                    </p>
                    <div className={styles.listings__details}>
                      <span>{item.rooms || "N/A"} <FormattedMessage id="rooms_short" defaultMessage="комн." /></span>
                      <span>{item.area || "N/A"} <FormattedMessage id="square_meters" defaultMessage="м²" /></span>
                      {item.floor && <span><FormattedMessage id="floor" defaultMessage="Этаж" />: {item.floor}</span>}
                      {item.land_area && <span>{item.land_area} <FormattedMessage id="sotka" defaultMessage="соток" /></span>}
                      {item.commercial_type && (
                        <span>{formatCommercialType(item.commercial_type)}</span>
                      )}
                      <span>{formatPropertyType(item.property_type)}</span>
                    </div>
                    <div className={styles.listings__actions}>
                      <button
                        className={`${styles.listings__action_button} ${
                          likedListings.has(item.id)
                            ? styles["listings__action_button--liked"]
                            : ""
                        }`}
                        onClick={(e) => handleLike(item.id, e)}
                        disabled={likedListings.has(item.id)}
                        title={intl.formatMessage({ id: 'like_button', defaultMessage: 'Лайк' })}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill={likedListings.has(item.id) ? "#ef4444" : "none"}
                          stroke={likedListings.has(item.id) ? "#ef4444" : "#4b5563"}
                          strokeWidth="2"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span>{item.likes_count || 0}</span>
                      </button>
                      <button
                        className={`${styles.listings__action_button} ${
                          favorites.some((fav) => fav.id === item.id)
                            ? styles["listings__action_button--active"]
                            : ""
                        }`}
                        onClick={(e) => handleFavorite(item, e)}
                        title={intl.formatMessage({ id: 'favorite_button', defaultMessage: 'В избранное' })}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill={favorites.some((fav) => fav.id === item.id) ? "#ef4444" : "none"}
                          stroke={favorites.some((fav) => fav.id === item.id) ? "#ef4444" : "#4b5563"}
                          strokeWidth="2"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                      <button
                        className={styles.listings__action_button}
                        onClick={(e) => handleShare(item, e)}
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
                      <button
                        className={styles.listings__action_button}
                        onClick={(e) => handleEdit(item, e)}
                        title={intl.formatMessage({ id: 'edit_button', defaultMessage: 'Изменить' })}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#4b5563"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        className={styles.listings__action_button}
                        onClick={(e) => handleDelete(item.id, e)}
                        title={intl.formatMessage({ id: 'delete_button', defaultMessage: 'Удалить' })}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="2"
                        >
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-1 5v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-7m-4-3h18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              ) : (
                <article
                  key={`empty-${index}`}
                  className={styles.listings__card_empty}
                >
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
              )
            )}
          </div>
          {listings.length > listingsPerPage && (
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
          formatPropertyType={formatPropertyType}
          formatDealType={formatDealType}
          formatCondition={formatCondition}
          formatDocument={formatDocument}
          formatComplex={formatComplex}
          formatUtilities={formatUtilities}
          formatPurpose={formatPurpose}
          formatCommercialType={formatCommercialType}
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

export default MyListings;