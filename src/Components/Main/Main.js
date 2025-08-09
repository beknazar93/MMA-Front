import React from 'react';
import Home from './Home/Home';
import We from './We/We';
import Programs from './Programs/Programs';
import Benefit from './Benefit/Benefit';
import Companye from './Companye/Companye';
import Follow from './Follow/Follow';

function Main() {
  return (
    <section className='Main'>
      <Home />
      <We />
      <Programs />
      <Benefit />
      <Follow/>
      <hr />
      <Companye />
    </section>
  )
}
export default Main
