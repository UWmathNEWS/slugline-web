import React, { useState, useEffect } from 'react';

import './Header.scss';
import { getLatestIssue, Issue } from '../api/api';
import SluglineNav from './SluglineNav';

const headerDateOpts = {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
};

const Header = () => {

    const [latestIssue, setLatestIssue] = useState<Issue>();

    useEffect(() => {
        getLatestIssue().then((resp) => {
            setLatestIssue(resp.data);
        });
    }, []);

    return (
        <React.Fragment>
            <header>
                <div className="blackbox d-flex justify-content-between">
                    <div className="header-logo">
                        <span className="mathnews-logo"></span>
                    </div>
                    <div className="header-info">
                        <h1>Volume {latestIssue?.volume_num} Issue {latestIssue?.issue_num}</h1>
                        <h3>{new Date().toLocaleDateString('en-US', headerDateOpts)}</h3>
                    </div>
                </div>
            </header>
            <SluglineNav />
        </React.Fragment>
    );
}

export default Header;
