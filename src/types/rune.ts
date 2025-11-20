export interface Rune {
    id: number;
    key: string;
    icon: string;
    name: string;
    shortDesc: string;
    longDesc: string;
}

export interface RuneSlot {
    runes: Rune[];
}

export interface RuneTree {
    id: number;
    key: string;
    icon: string;
    name: string;
    slots: RuneSlot[];
}

// The API returns an array of RuneTree
export type RuneDataResponse = RuneTree[];
