import React from 'react';

const Header = () => {
    return (
        <header>
            <div className="blackbox d-flex justify-content-between">
                <h1 className="display-1">
                    <span className="mathnews-logo"></span>
                </h1>
                <div className="d-flex-column text-right py-2">
                    <h1>Volume ??? Issue ???</h1>
                    <h3>August 6th, 2016</h3>
                </div>
            </div>
        </header>
    );
}

export default Header;
