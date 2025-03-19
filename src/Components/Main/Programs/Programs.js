import React from 'react';
import they from '../Programs/img/общие.png';
import kids from '../Programs/img/kids.png';
import vip from '../Programs/img/вип1.png';
import big from '../Programs/img/big.png';
import './Programs.scss';

function Programs() {
  return (
    <section className='programs'>
      <div className="container">

        <div className='programs__header'>
          <h1 className='programs__title'>Профессиональная школа ММА</h1>
          <p className='programs__subtitle'>Наши программы обучения для любых возрастов</p>
        </div>

        <div className="programs__groups">

          <div className="programs__group">
            <img className='programs__group-img' src={kids} alt="Детская группа" />
            <div className="programs__group-info">
              <h2 className='programs__group-title'>Детская группа</h2>
              <p className='programs__group-text'>
                Всестороннее развитие ребенка. Любой уровень подготовки. Набор круглый год. Пробное занятие бесплатно.
              </p>
            </div>
          </div>

          <div className="programs__group">
            <img className='programs__group-img' src={big} alt="Взрослая группа" />
            <div className="programs__group-info">
              <h2 className='programs__group-title'>Взрослая группа</h2>
              <p className='programs__group-text'>
                Запись в общие группы ММА для взрослых. Любой уровень подготовки. Пробное занятие бесплатно.
              </p>
            </div>
          </div>

          <div className="programs__group">
            <img className='programs__group-img' src={vip} alt="VIP занятие" />
            <div className="programs__group-info">
              <h2 className='programs__group-title'>VIP занятие</h2>
              <p className='programs__group-text'>
                Индивидуальные тренировки. Максимальное внимание тренера и персональный подход.
              </p>
            </div>
          </div>

          <div className="programs__group">
            <img className='programs__group-img' src={they} alt="Общие занятия" />
            <div className="programs__group-info">
              <h2 className='programs__group-title'>Общие занятия</h2>
              <p className='programs__group-text'>
                Групповые тренировки для всех возрастов и уровней подготовки.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Programs;