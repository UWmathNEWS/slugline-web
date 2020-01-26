import React from 'react';
import './slugline.scss';

import Header from './header/Header';

const App: React.FC = () => {
  return (
    <div className="container">
      <Header />
      <p>CONTENT</p>
    </div>
  );
}

export default App;
