import React, { useState } from 'react';
import HeroSection from '../../pages/HeroSection/HeroSection';
import Listings from '../../pages/Listings/Listings';
import EditListing from '../EditListing/EditListing';
import styles from './ListingManager.module.scss';

const ListingManager = () => {
  const [activeTab, setActiveTab] = useState('listings');
  const [searchParams, setSearchParams] = useState({});
  const [listingsCount, setListingsCount] = useState(0);

  const handleSearch = (params, count) => {
    setSearchParams(params);
    setListingsCount(count);
  };

  return (
    <div className={styles.container}>
      {activeTab === 'listings' && (
        <div className={styles.hero}>
          <HeroSection onSearch={handleSearch} />
        </div>
      )}
      <div className={styles.tab__content}>
        {activeTab === 'listings' && <Listings searchParams={searchParams} listingsCount={listingsCount} />}
        {activeTab === 'edit' && <EditListing />}
      </div>
    </div>
  );
};

export default ListingManager;