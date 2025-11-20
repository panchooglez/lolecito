import React, { useEffect, useState, useRef } from 'react';
import { getItems, getVersion } from '../services/dataService';
import type { Item } from '../types/item';
import './Items.css';

interface TooltipState {
    visible: boolean;
    x: number;
    y: number;
    content: Item | null;
}

const Items: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [version, setVersion] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [activeStat, setActiveStat] = useState<string>('All');

    const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, content: null });
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemsData, ver] = await Promise.all([getItems(), getVersion()]);
                // Filter out items without maps (usually internal/test items) and ensure they have gold data
                const validItems = itemsData.filter(item =>
                    item.maps &&
                    item.maps['11'] === true && // Summoner's Rift
                    item.gold &&
                    item.gold.purchasable
                );
                setItems(validItems);
                setVersion(ver);
            } catch (error) {
                console.error('Failed to fetch items', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleMouseEnter = (e: React.MouseEvent, item: Item) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        // Calculate position to keep on screen (Viewport relative for position: fixed)
        let x = rect.left + rect.width / 2;
        let y = rect.top - 10; // Default above

        // Simple boundary check
        if (x < 150) x = 150;
        if (x > window.innerWidth - 150) x = window.innerWidth - 150;
        if (y < 200) y = rect.bottom + 10; // Flip to bottom if too close to top

        setTooltip({
            visible: true,
            x,
            y,
            content: item
        });
    };

    const handleMouseLeave = () => {
        setTooltip({ ...tooltip, visible: false });
    };

    // Categorization Logic
    const categories = ['All', 'Starter', 'Boots', 'Basic', 'Epic', 'Legendary'];
    const stats = ['All', 'Damage', 'SpellDamage', 'Armor', 'SpellBlock', 'Health', 'AttackSpeed', 'Mana', 'CooldownReduction', 'CriticalStrike'];

    const getItemCategory = (item: Item): string => {
        if (item.tags.includes('Boots')) return 'Boots';
        if (item.tags.includes('Jungle') || item.tags.includes('Lane')) {
            if (item.gold.total < 500 && !item.into?.length) return 'Starter';
        }
        if (item.gold.total < 500 && !item.from?.length) return 'Starter';

        const depth = item.depth || 1;

        if (depth === 1) return 'Basic';
        if (depth === 2) return 'Epic';
        if (depth >= 3) return 'Legendary';

        return 'Basic';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const category = getItemCategory(item);
        const matchesCategory = activeCategory === 'All' || category === activeCategory;

        let matchesStat = activeStat === 'All';
        if (activeStat !== 'All') {
            matchesStat = item.tags.includes(activeStat);
        }

        return matchesSearch && matchesCategory && matchesStat;
    });

    const groupedItems = activeCategory === 'All'
        ? {
            'Starter': filteredItems.filter(i => getItemCategory(i) === 'Starter'),
            'Boots': filteredItems.filter(i => getItemCategory(i) === 'Boots'),
            'Basic': filteredItems.filter(i => getItemCategory(i) === 'Basic'),
            'Epic': filteredItems.filter(i => getItemCategory(i) === 'Epic'),
            'Legendary': filteredItems.filter(i => getItemCategory(i) === 'Legendary'),
        }
        : { [activeCategory]: filteredItems };

    if (loading) return <div className="loading">Loading Items...</div>;

    return (
        <div className="items-page">
            <div className="filters-container">
                <input
                    type="text"
                    placeholder="Search Items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />

                <div className="filter-group">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="filter-group">
                    {stats.map(stat => (
                        <button
                            key={stat}
                            className={`filter-btn ${activeStat === stat ? 'active' : ''}`}
                            onClick={() => setActiveStat(stat)}
                        >
                            {stat.replace('Mod', '')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="items-content">
                {Object.entries(groupedItems).map(([category, categoryItems]) => (
                    categoryItems.length > 0 && (
                        <div key={category} className="category-section">
                            <h2 className="category-title">{category} Items</h2>
                            <div className="items-grid">
                                {categoryItems.map((item, index) => (
                                    <div
                                        key={`${item.name}-${index}`}
                                        className="item-card"
                                        onMouseEnter={(e) => handleMouseEnter(e, item)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div className="item-image-wrapper">
                                            <img
                                                src={`http://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`}
                                                alt={item.name}
                                                className="item-image"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="item-cost-overlay">
                                            {item.gold.total}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>

            {tooltip.visible && tooltip.content && (
                <div
                    className="fixed-tooltip"
                    style={{
                        top: tooltip.y,
                        left: tooltip.x,
                    }}
                    ref={tooltipRef}
                >
                    <div className="tooltip-header">
                        <div className="tooltip-title">{tooltip.content.name}</div>
                        <div className="tooltip-cost"><span className="gold-icon"></span> {tooltip.content.gold.total}</div>
                    </div>
                    <div className="tooltip-description" dangerouslySetInnerHTML={{ __html: tooltip.content.description }} />
                </div>
            )}
        </div>
    );
};

export default Items;
