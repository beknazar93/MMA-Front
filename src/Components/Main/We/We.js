import React from 'react';
import trener from '../We/img/тренер.png';
import price from '../We/img/price.png';
import eye from '../We/img/eye.png';
import './We.scss';

function We() {
  return (
    <section className='we'>
      <div className="container">
        <div className="we__header">
          <h1 className='we__title'>Почему мы?</h1>
          <p className='we__subtitle'>Наши преимущества перед другими школами</p>
        </div>

        <div className="we__cards">
          <div className="we__card">
            <img className='we__card-icon' src={trener} alt="Тренеры" />
            <h3 className='we__card-title'>Квалифицированные тренеры</h3>
            <p className='we__card-text'>
              Занятия проводят квалифицированные тренеры, среди которых есть мастера международного класса.
            </p>
          </div>

          <div className="we__card">
            <img className='we__card-icon' src={price} alt="Команда" />
            <h3 className='we__card-title'>Профессиональная команда</h3>
            <p className='we__card-text'>
              Группа работает над общей целью: обязанности и ответственность в команде четко распределены.
            </p>
          </div>

          <div className="we__card">
            <img className='we__card-icon' src={eye} alt="Спортивные комплексы" />
            <h3 className='we__card-title'>Лучшие спортивные комплексы</h3>
            <p className='we__card-text'>
              Современные спортивные залы помогают поддерживать отличную форму и хорошее настроение.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default We;
