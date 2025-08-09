import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import styles from './Contacts.module.scss';

const Contacts = () => {
  const propertyTypes = [
    { id: 'apartment', labelId: 'property_apartment', icon: 'M12 2H4v20h16V8h-8V2zm-2 18H6v-4h4v4zm0-6H6v-4h4v4zm0-6H6V4h4v4zm6 10h-4v-4h4v4zm0-6h-4v-4h4v4z' },
    { id: 'house', labelId: 'property_house', icon: 'M3 12l9-9 9 9v10a2 2 0 01-2 2H5a2 2 0 01-2-2V12zm6 8h6v-6H9v6zm0-8h6V6H9v6z' },
    { id: 'commercial', labelId: 'property_commercial', icon: 'M3 5v14a2 2 0 002 2h14a2 2 0 002-2V5H3zm2 2h14v6H5V7zm0 8h6v4H5v-4zm8 0h6v4h-6v-4z' },
  ];

  return (
    <section id="contacts" className={styles.contacts}>
      <div className={styles.contacts__container}>
        <h2 className={styles.contacts__title}>
          <FormattedMessage id="contacts_title" defaultMessage="Недвижимость" />
        </h2>
        <div className={styles.contacts__content}>
          <div className={styles.contacts__types}>
            <ul className={styles.contacts__types_list}>
              {propertyTypes.map((type) => (
                <li key={type.id} className={styles.contacts__type}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <path d={type.icon} />
                  </svg>
                  <Link to={`/listings?property_type=${type.id}`}>
                    <FormattedMessage id={type.labelId} defaultMessage={type.id} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <ul className={styles.contacts__list}>
            <li className={styles.contacts__item}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H5V8l7 5 7-5v10zm-7 0V9" />
              </svg>
              <a href="mailto:info@darek.kg">
                <FormattedMessage id="contacts_email" defaultMessage="info@darek.kg" />
              </a>
            </li>
            <li className={styles.contacts__item}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              <a href="tel:+996123456789">
                <FormattedMessage id="contacts_phone" defaultMessage="+996 123 456 789" />
              </a>
            </li>
            <li className={styles.contacts__item}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <FormattedMessage id="contacts_address" defaultMessage="г. Ош, ул. Ленина 12, офис 101" />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Contacts;