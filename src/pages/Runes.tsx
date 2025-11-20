import React, { useEffect, useState, useRef } from 'react';
import { getRunes } from '../services/dataService';
import type { RuneTree, Rune } from '../types/rune';
import './Runes.css';

interface TooltipState {
    visible: boolean;
    x: number;
    y: number;
    content: Rune | null;
}

const Runes: React.FC = () => {
    const [runeTrees, setRuneTrees] = useState<RuneTree[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);

    const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, content: null });
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getRunes();
                setRuneTrees(data);
                if (data.length > 0) {
                    setSelectedTreeId(data[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch runes', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleMouseEnter = (e: React.MouseEvent, rune: Rune) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        let x = rect.left + rect.width / 2;
        let y = rect.top - 10;

        // Boundary checks
        if (x < 150) x = 150;
        if (x > window.innerWidth - 150) x = window.innerWidth - 150;
        if (y < 200) y = rect.bottom + 10;

        setTooltip({
            visible: true,
            x,
            y,
            content: rune
        });
    };

    const handleMouseLeave = () => {
        setTooltip({ ...tooltip, visible: false });
    };

    if (loading) return <div className="loading">Loading Runes...</div>;

    const selectedTree = runeTrees.find(tree => tree.id === selectedTreeId);

    return (
        <div className="runes-page">
            <div className="rune-paths">
                {runeTrees.map(tree => (
                    <div
                        key={tree.id}
                        className={`rune-path-icon ${selectedTreeId === tree.id ? 'active' : ''}`}
                        onClick={() => setSelectedTreeId(tree.id)}
                    >
                        <img
                            src={`https://ddragon.leagueoflegends.com/cdn/img/${tree.icon}`}
                            alt={tree.name}
                        />
                        <span>{tree.name}</span>
                    </div>
                ))}
            </div>

            {selectedTree && (
                <div className="rune-tree-details">
                    <h2>{selectedTree.name}</h2>
                    <div className="rune-slots">
                        {selectedTree.slots.map((slot, index) => (
                            <div key={index} className="rune-row">
                                {slot.runes.map(rune => (
                                    <div
                                        key={rune.id}
                                        className="rune-item"
                                        onMouseEnter={(e) => handleMouseEnter(e, rune)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <img
                                            src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`}
                                            alt={rune.name}
                                            className="rune-icon"
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tooltip.visible && tooltip.content && (
                <div
                    className="rune-fixed-tooltip"
                    style={{
                        top: tooltip.y,
                        left: tooltip.x,
                    }}
                    ref={tooltipRef}
                >
                    <div className="rune-tooltip-header">
                        <div className="rune-tooltip-title">{tooltip.content.name}</div>
                    </div>
                    <div className="rune-tooltip-desc" dangerouslySetInnerHTML={{ __html: tooltip.content.longDesc }} />
                </div>
            )}
        </div>
    );
};

export default Runes;
