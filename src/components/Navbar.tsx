import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">LOLECITO</Link>
            </div>
            <ul className="navbar-links">
                <li><Link to="/champions">Champions</Link></li>
                <li><Link to="/items">Items</Link></li>
                <li><Link to="/runes">Runes</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
