import React from 'react';

import './Header.scss';

const Header = () => {
    return (
        <header>
            <div className="blackbox d-flex justify-content-between">
                <div className="header-logo">
                    <span className="mathnews-logo"></span>
                </div>
                <div className="header-info">
                    <h1>Volume ??? Issue ???</h1>
                    <h3>August 6th, 2016</h3>
                </div>
            </div>
        </header>
    );
}

export default Header;
