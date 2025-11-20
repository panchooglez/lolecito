export interface ItemStats {
    FlatHPPoolMod?: number;
    FlatMPPoolMod?: number;
    FlatHPRegenMod?: number;
    FlatPhysicalDamageMod?: number;
    FlatMagicDamageMod?: number;
    FlatMovementSpeedMod?: number;
    FlatArmorMod?: number;
    FlatSpellBlockMod?: number;
    PercentAttackSpeedMod?: number;
    FlatCritChanceMod?: number;
    [key: string]: number | undefined;
}

export interface ItemImage {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface ItemGold {
    base: number;
    purchasable: boolean;
    total: number;
    sell: number;
}

export interface Item {
    name: string;
    description: string;
    colloq: string;
    plaintext: string;
    into?: string[];
    from?: string[];
    depth?: number;
    image: ItemImage;
    gold: ItemGold;
    tags: string[];
    maps: { [key: string]: boolean };
    stats: ItemStats;
}

export interface ItemDataResponse {
    type: string;
    version: string;
    basic: any;
    data: { [key: string]: Item };
    groups: any[];
    tree: any[];
}
