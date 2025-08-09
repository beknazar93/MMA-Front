import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import axios from 'axios';
import styles from './About.module.scss';

const About = ({ language = 'ru' }) => {
  const [apiText, setApiText] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const intl = useIntl();

  useEffect(() => {
    const fetchText = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://dar.kg/api/v1/listings/text-message/');
        setApiText(response.data);
      } catch (err) {
        setError(intl.formatMessage({ id: 'error_loading' }));
        console.error('Ошибка загрузки текстов:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchText();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <p className={styles.about__text}>
          <FormattedMessage id="loading" />
        </p>
      );
    }

    if (error) {
      return <p className={styles.about__text}>{error}</p>;
    }

    if (apiText.length === 0) {
      return (
        <p className={styles.about__text}>
          <FormattedMessage id="no_data" />
        </p>
      );
    }

    return apiText.map(item => (
      <p key={item.id} className={styles.about__text}>
        {language === 'ru' ? item.text_ru : item.text_ky}
      </p>
    ));
  };

  return (
    <section id="about" className={styles.about}>
      <div className={styles.about__container}>
        <h2 className={styles.about__title}>
          <FormattedMessage id="about_title" />
        </h2>
        <div className={styles.about__content}>
          {renderContent()}
          <div className={styles.about__stats}>
            {[
              { number: '10+', id: 'years_experience' },
              { number: '500+', id: 'deals' },
              { number: '1000+', id: 'satisfied_clients' },
            ].map(({ number, id }, index) => (
              <div key={index} className={styles.about__stat}>
                <span className={styles.about__statNumber}>{number}</span>
                <p className={styles.about__statLabel}>
                  <FormattedMessage id={id} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;