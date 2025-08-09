import React from "react";
import PropTypes from 'prop-types';

const HeaderClients = ({ title, error, onLogout }) => {
  return (
    <div>
      <h1>{title}</h1>
      {onLogout && (
        <button className="logout-button" onClick={onLogout}>
          Выйти
        </button>
      )}
      {error && <div className="error-notification">{error}</div>}
    </div>
  );
};

HeaderClients.propTypes = {
  title: PropTypes.string.isRequired,
  error: PropTypes.string,
  onLogout: PropTypes.func,
};

export default HeaderClients;
