import React from 'react';
import './Home.css';

const Home: React.FC = () => {
    return (
        <div className="home-container">
            <div className="hero">
                <h1>Welcome to <span className="highlight">Lolecito</span></h1>
                <p>Your premium source for League of Legends data and insights.</p>
                <div className="cta-buttons">
                    <a href="/champions" className="btn-primary">Explore Champions</a>
                    <a href="/items" className="btn-secondary">View Items</a>
                </div>
            </div>
        </div>
    );
};

export default Home;
