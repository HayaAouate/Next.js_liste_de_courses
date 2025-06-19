import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Tabs({ tabs }) {
    const location = useLocation();



    return (
        <div style={{ width: '100%' }}>
            <ul className="tabs is-boxed is-fullwidth is-medium" style={{ borderBottom: '1px solid #dbdbdb', marginBottom: 0 }}>
                <li className={location.pathname === '/' ? 'is-active' : ''}>
                    <Link to="/" className="has-text-weight-semibold">
                        <span className="icon"><i className="fas fa-home"></i></span>
                        <span>Accueil</span>
                    </Link>
                </li>
                {tabs.map((tab) => {
                    const path = `/${tab.toLowerCase()}`;
                    const iconName = tab.toLowerCase();
                    return (
                        <li key={tab} className={location.pathname === path ? 'is-active' : ''}>
                            <Link to={path} className="has-text-weight-semibold">
                                <span className="icon"><i className={`fas fa-${iconName === 'liddle' ? 'shopping-basket' : 'store'}`}></i></span>
                                <span>{tab}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default Tabs;