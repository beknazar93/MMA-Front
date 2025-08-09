import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './SingleListing.module.scss'; // Предполагается, что стили созданы

const SingleListing = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`https://dar.kg/api/v1/listings/${id}/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setListing(data);
        } else {
          setError('Не удалось загрузить объявление.');
        }
      } catch {
        setError('Ошибка сети. Попробуйте позже.');
      }
    };
    fetchListing();
  }, [id]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!listing) return <div>Загрузка...</div>;

  return (
    <div className={styles.singleListing}>
      <h1>{listing.title}</h1>
      <p>{listing.description}</p>
      {/* Другие поля объявления */}
    </div>
  );
};

export default SingleListing;