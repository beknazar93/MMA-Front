import React from 'react';
import ClientIncome from './ClientIncome';
import TrainerAnalytics from './Trainer/TrainerAnalytics';
import Sport from './Sport';
import StudentsComparison from './StudentsComparison';

function Analitic() {
  return (
    <div>
      <ClientIncome/>
      <Sport/>
      <StudentsComparison/>
      <TrainerAnalytics/>
    </div>
  )
}

export default Analitic
