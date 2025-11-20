import type { ChampionDataResponse, Champion } from '../types/champion';
import type { ItemDataResponse, Item } from '../types/item';
import type { RuneDataResponse, RuneTree } from '../types/rune';



const BASE_URL = '/data';

export const getChampions = async (): Promise<Champion[]> => {
    const response = await fetch(`${BASE_URL}/champion.json`);
    const data: ChampionDataResponse = await response.json();
    return Object.values(data.data);
};

export const getChampion = async (id: string): Promise<Champion | undefined> => {
    const champions = await getChampions();
    return champions.find(c => c.id === id);
};

export const getItems = async (): Promise<Item[]> => {
    const response = await fetch(`${BASE_URL}/item.json`);
    const data: ItemDataResponse = await response.json();
    return Object.values(data.data);
};

export const getRunes = async (): Promise<RuneTree[]> => {
    const response = await fetch(`${BASE_URL}/runes.json`);
    const data: RuneDataResponse = await response.json();
    return data;
};


export const getVersion = async (): Promise<string> => {
    const response = await fetch(`${BASE_URL}/version.json`);
    const data = await response.json();
    return data.version;
}
