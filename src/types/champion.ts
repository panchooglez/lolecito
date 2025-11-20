export interface ChampionImage {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface ChampionStats {
    hp: number;
    hpperlevel: number;
    mp: number;
    mpperlevel: number;
    movespeed: number;
    armor: number;
    armorperlevel: number;
    spellblock: number;
    spellblockperlevel: number;
    attackrange: number;
    hpregen: number;
    hpregenperlevel: number;
    mpregen: number;
    mpregenperlevel: number;
    crit: number;
    critperlevel: number;
    attackdamage: number;
    attackdamageperlevel: number;
    attackspeedperlevel: number;
    attackspeed: number;
}

export interface ChampionInfo {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
}

export interface ChampionSpell {
    id: string;
    name: string;
    description: string;
    tooltip: string;
    image: ChampionImage;
    cooldownBurn: string;
    costBurn: string;
}

export interface ChampionPassive {
    name: string;
    description: string;
    image: ChampionImage;
}

export interface Champion {
    id: string;
    key: string;
    name: string;
    title: string;
    image: ChampionImage;
    skins: any[];
    lore: string;
    blurb: string;
    allytips: string[];
    enemytips: string[];
    tags: string[];
    partype: string;
    info: ChampionInfo;
    stats: ChampionStats;
    spells: ChampionSpell[];
    passive: ChampionPassive;
}

export interface ChampionDataResponse {
    type: string;
    format: string;
    version: string;
    data: { [key: string]: Champion };
}
