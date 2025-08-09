import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './BackgroundImage.module.scss';

const BackgroundImage = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('https://dar.kg/api/v1/listings/images/');
        const data = response.data;
        if (Array.isArray(data) && data.every(item => item.image)) {
          setImages(data);
        } else if (data && data.image) {
          setImages([data]);
        } else {
          throw new Error('Неверный формат данных');
        }
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка загрузки изображений');
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  if (isLoading) return <div className={styles['background-image__loading']}>Загрузка...</div>;
  if (error) return <div className={styles['background-image__error']}>{error}</div>;

  return (
    <div className={styles['background-image']}>
      {images.length === 1 ? (
        <img
          src={images[0].image}
          srcSet={images[0].thumbnail ? `${images[0].thumbnail} 800w, ${images[0].image} 1920w` : `${images[0].image} 1920w`}
          sizes="(max-width: 768px) 800px, 1920px"
          alt="Background"
          className={styles['background-image__img']}
        />
      ) : images.length > 1 ? (
        <div className={styles['background-image__slider']}>
          <button
            className={`${styles['background-image__button']} ${styles['background-image__button--prev']}`}
            onClick={handlePrev}
            aria-label="Предыдущее изображение"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <img
            src={images[currentIndex].image}
            srcSet={images[currentIndex].thumbnail ? `${images[currentIndex].thumbnail} 800w, ${images[currentIndex].image} 1920w` : `${images[currentIndex].image} 1920w`}
            sizes="(max-width: 768px) 800px, 1920px"
            alt="Slider"
            className={styles['background-image__img']}
          />
          <button
            className={`${styles['background-image__button']} ${styles['background-image__button--next']}`}
            onClick={handleNext}
            aria-label="Следующее изображение"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      ) : (
        <div className={styles['background-image__placeholder']}></div>
      )}
    </div>
  );
};

export default BackgroundImage;