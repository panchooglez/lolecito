import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getChampions, getVersion } from '../services/dataService';
import type { Champion } from '../types/champion';
import './Champions.css';

const Champions: React.FC = () => {
    const [champions, setChampions] = useState<Champion[]>([]);
    const [version, setVersion] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [champs, ver] = await Promise.all([getChampions(), getVersion()]);
                setChampions(champs);
                setVersion(ver);
            } catch (error) {
                console.error('Failed to fetch champions', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredChampions = champions.filter(champion =>
        champion.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading">Loading Champions...</div>;
    }

    return (
        <div className="champions-page">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search Champions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            <div className="champions-grid">
                {filteredChampions.map(champion => (
                    <Link to={`/champions/${champion.id}`} key={champion.id} className="champion-card">
                        <div className="champion-image-wrapper">
                            <img
                                src={`http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`}
                                alt={champion.name}
                                className="champion-image"
                                loading="lazy"
                            />
                        </div>
                        <div className="champion-name">{champion.name}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Champions;
