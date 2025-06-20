import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Tabs({ tabs }) {
    const location = useLocation();



    return (
        <div style={{ width: '100%', marginBottom: '1rem' }}>
            <div className="tabs is-boxed is-fullwidth is-medium" style={{ marginBottom: 0 }}>
                <ul>
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
        </div>
    );
}

export default Tabs;