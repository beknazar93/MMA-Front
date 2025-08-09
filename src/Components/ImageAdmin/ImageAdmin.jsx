import React, { useState, useEffect } from 'react';
import styles from './ImageAdmin.module.scss';

const ImageAdmin = () => {
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');
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
      throw new Error('Failed to refresh token');
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

  const fetchImages = async () => {
    try {
      const response = await fetchWithAuth('https://dar.kg/api/v1/listings/images/');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) setImages(data);
      } else {
        setNotification({ message: 'Ошибка загрузки изображений', type: 'error', visible: true });
      }
    } catch {
      setNotification({ message: 'Ошибка загрузки изображений', type: 'error', visible: true });
    }
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetchWithAuth(`https://dar.kg/api/v1/listings/images/${id}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setImages(images.filter(image => image.id !== id));
        if (selectedImageId === id) setSelectedImageId(null);
        if (images.length === 1) setIsPreviewOpen(false);
        setNotification({ message: 'Изображение удалено', type: 'success', visible: true });
      } else {
        setNotification({ message: 'Ошибка удаления изображения', type: 'error', visible: true });
      }
    } catch {
      setNotification({ message: 'Ошибка удаления изображения', type: 'error', visible: true });
    }
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
  };

  const handleCreate = async () => {
    if (!newImage) return;
    const formData = new FormData();
    formData.append('image', newImage);

    try {
      const response = await fetchWithAuth('https://dar.kg/api/v1/listings/images/', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const newImageData = await response.json();
        setImages([...images, newImageData]);
        setNewImage(null);
        setNotification({ message: 'Изображение добавлено', type: 'success', visible: true });
      } else {
        setNotification({ message: 'Ошибка добавления изображения', type: 'error', visible: true });
      }
    } catch {
      setNotification({ message: 'Ошибка добавления изображения', type: 'error', visible: true });
    }
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
  };

  const togglePreview = () => {
    setIsPreviewOpen(!isPreviewOpen);
    if (!isPreviewOpen) setSelectedImageId(null);
  };

  const handleSelectImage = (id) => {
    setSelectedImageId(id);
  };

  return (
    <section className={styles.imageAdmin}>
      <div className={styles.imageAdmin__container}>
        <h2 className={styles.imageAdmin__title}>Изображения</h2>
        <div className={styles.imageAdmin__controls}>
          <input
            type="file"
            accept="image/*"
            className={styles.imageAdmin__input}
            onChange={(e) => setNewImage(e.target.files[0])}
          />
          <button
            className={`${styles.imageAdmin__button} ${styles['imageAdmin__button--create']}`}
            onClick={handleCreate}
            disabled={!newImage}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 5v14m-7-7h14" />
            </svg>
          </button>
          <button
            className={`${styles.imageAdmin__button} ${styles['imageAdmin__button--preview']}`}
            onClick={togglePreview}
            disabled={images.length === 0}
          >
            <svg viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
        {notification.visible && (
          <div className={`${styles.imageAdmin__notification} ${styles[`notification--${notification.type}`]}`}>
            {notification.message}
          </div>
        )}
        {isPreviewOpen && images.length > 0 ? (
          <div className={styles.imageAdmin__preview}>
            <div className={styles.imageAdmin__list}>
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`${styles.imageAdmin__item} ${
                    selectedImageId === image.id ? styles['imageAdmin__item--selected'] : ''
                  }`}
                  onClick={() => handleSelectImage(image.id)}
                >
                  <img
                    src={image.image}
                    alt="Thumbnail"
                    className={styles.imageAdmin__thumbnail}
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                  />
                </div>
              ))}
            </div>
            {selectedImageId && (
              <div className={styles.imageAdmin__selected}>
                <img
                  src={images.find((img) => img.id === selectedImageId).image}
                  alt="Selected"
                  className={styles.imageAdmin__img}
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/600')}
                />
                <button
                  className={`${styles.imageAdmin__button} ${styles['imageAdmin__button--delete']}`}
                  onClick={() => handleDelete(selectedImageId)}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : isPreviewOpen && images.length === 0 ? (
          <div className={styles.imageAdmin__empty}>Нет изображений</div>
        ) : null}
      </div>
    </section>
  );
};

export default ImageAdmin;