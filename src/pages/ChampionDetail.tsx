import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChampion, getVersion, getItems } from '../services/dataService';
import { buildEngine } from '../services/buildEngine/BuildEngine';
import type { Champion } from '../types/champion';
import type { Item } from '../types/item';
import './ChampionDetail.css';

const ChampionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [champion, setChampion] = useState<Champion | null>(null);
    const [version, setVersion] = useState<string>('');
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    const [champ, ver, allItems] = await Promise.all([
                        getChampion(id),
                        getVersion(),
                        getItems()
                    ]);
                    setChampion(champ || null);
                    setVersion(ver);
                    setItems(allItems);
                } catch (error) {
                    console.error('Failed to fetch champion details', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [id]);

    /**
     * USA EL NUEVO BUILD ENGINE
     * Ahora la lógica de builds sigue los principios del jugador profesional:
     * - No hay builds estáticas
     * - Todo se evalúa por contexto
     * - Sistema de scoring ponderado
     */
    const getRecommendedItems = (champion: Champion | null, allItems: Item[]): { boots: Item[], core: Item[], tips: string[] } => {
        if (!champion || !allItems.length) return { boots: [], core: [], tips: [] };

        // Usar el BuildEngine con contexto por defecto
        const recommendation = buildEngine.generateBuild(champion, allItems);

        return {
            boots: recommendation.boots,
            core: recommendation.coreItems,
            tips: recommendation.tips
        };
    };

    if (loading) return <div className="loading">Loading Champion...</div>;
    if (!champion) return <div className="error">Champion not found.</div>;

    const splashUrl = `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`;
    const passiveUrl = `http://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${champion.passive.image.full}`;

    const recommendedBuild = getRecommendedItems(champion, items);

    return (
        <div className="champion-detail-container">
            <div className="champion-header" style={{ backgroundImage: `linear-gradient(to bottom, rgba(9, 20, 40, 0.2), #091428), url(${splashUrl})` }}>
                <div className="champion-header-content">
                    <h2 className="champion-title">{champion.title}</h2>
                    <h1 className="champion-name-large">{champion.name}</h1>
                    <div className="champion-tags">
                        {champion.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                    <div className="champion-roles">
                        <div className="role-stat">
                            <span className="role-label">Attack</span>
                            <div className="stat-bar"><div className="stat-fill" style={{ width: `${champion.info.attack * 10}%` }}></div></div>
                        </div>
                        <div className="role-stat">
                            <span className="role-label">Defense</span>
                            <div className="stat-bar"><div className="stat-fill" style={{ width: `${champion.info.defense * 10}%` }}></div></div>
                        </div>
                        <div className="role-stat">
                            <span className="role-label">Magic</span>
                            <div className="stat-bar"><div className="stat-fill" style={{ width: `${champion.info.magic * 10}%` }}></div></div>
                        </div>
                        <div className="role-stat">
                            <span className="role-label">Difficulty</span>
                            <div className="stat-bar"><div className="stat-fill" style={{ width: `${champion.info.difficulty * 10}%` }}></div></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="champion-content">
                <div className="content-grid">
                    <div className="left-column">
                        <div className="champion-section lore-section">
                            <h3>Lore</h3>
                            <p>{champion.lore}</p>
                        </div>

                        <div className="champion-section abilities-section">
                            <h3>Abilities</h3>

                            <div className="ability-row passive">
                                <div className="ability-icon-wrapper">
                                    <img src={passiveUrl} alt={champion.passive.name} className="ability-icon" />
                                    <span className="ability-key">P</span>
                                </div>
                                <div className="ability-info">
                                    <h4>{champion.passive.name}</h4>
                                    <p dangerouslySetInnerHTML={{ __html: champion.passive.description }}></p>
                                </div>
                            </div>

                            {champion.spells.map((spell, index) => {
                                const spellKeys = ['Q', 'W', 'E', 'R'];
                                return (
                                    <div key={spell.id} className="ability-row">
                                        <div className="ability-icon-wrapper">
                                            <img
                                                src={`http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image.full}`}
                                                alt={spell.name}
                                                className="ability-icon"
                                            />
                                            <span className="ability-key">{spellKeys[index]}</span>
                                        </div>
                                        <div className="ability-info">
                                            <h4>{spell.name}</h4>
                                            <div className="ability-meta">
                                                <span>Cost: {spell.costBurn} {champion.partype}</span>
                                                <span>Cooldown: {spell.cooldownBurn}s</span>
                                            </div>
                                            <p dangerouslySetInnerHTML={{ __html: spell.description }}></p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="right-column">
                        <div className="champion-section strategy-section">
                            <h3>Gameplay Identity</h3>

                            <div className="strategy-block">
                                <h4>Playing As {champion.name}</h4>
                                <ul>
                                    {champion.allytips.length > 0 ? (
                                        champion.allytips.map((tip, i) => <li key={i}>{tip}</li>)
                                    ) : (
                                        <li>Master your abilities to unleash {champion.name}'s full potential.</li>
                                    )}
                                </ul>
                            </div>

                            <div className="strategy-block danger">
                                <h4>Playing Against {champion.name}</h4>
                                <ul>
                                    {champion.enemytips.length > 0 ? (
                                        champion.enemytips.map((tip, i) => <li key={i}>{tip}</li>)
                                    ) : (
                                        <li>Watch out for their key cooldowns and punish mistakes.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="champion-section build-section">
                            <h3>Recommended Build</h3>
                            <div className="build-group">
                                <h4>Core Items</h4>
                                <div className="build-icons">
                                    {recommendedBuild.core.map(item => (
                                        <div key={item.name} className="build-item" title={item.name}>
                                            <img
                                                src={`http://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`}
                                                alt={item.name}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="build-group">
                                <h4>Boots Options</h4>
                                <div className="build-icons">
                                    {recommendedBuild.boots.map(item => (
                                        <div key={item.name} className="build-item" title={item.name}>
                                            <img
                                                src={`http://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`}
                                                alt={item.name}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {recommendedBuild.tips && recommendedBuild.tips.length > 0 && (
                                <div className="build-group build-tips">
                                    <h4>💡 Build Strategy Tips</h4>
                                    <ul className="tips-list">
                                        {recommendedBuild.tips.map((tip, index) => (
                                            <li key={index}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="champion-section stats-section">
                            <h3>Base Stats</h3>
                            <div className="stats-grid">
                                <div className="stat-item"><span>HP:</span> {champion.stats.hp} <span className="stat-growth">(+{champion.stats.hpperlevel})</span></div>
                                <div className="stat-item"><span>MP:</span> {champion.stats.mp} <span className="stat-growth">(+{champion.stats.mpperlevel})</span></div>
                                <div className="stat-item"><span>Armor:</span> {champion.stats.armor} <span className="stat-growth">(+{champion.stats.armorperlevel})</span></div>
                                <div className="stat-item"><span>MR:</span> {champion.stats.spellblock} <span className="stat-growth">(+{champion.stats.spellblockperlevel})</span></div>
                                <div className="stat-item"><span>Attack:</span> {champion.stats.attackdamage} <span className="stat-growth">(+{champion.stats.attackdamageperlevel})</span></div>
                                <div className="stat-item"><span>Speed:</span> {champion.stats.movespeed}</div>
                                <div className="stat-item"><span>Range:</span> {champion.stats.attackrange}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="back-button-container">
                    <Link to="/champions" className="btn-secondary">Back to Champions</Link>
                </div>
            </div>
        </div>
    );
};

export default ChampionDetail;
