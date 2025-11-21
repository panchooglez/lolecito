/**
 * IBuildStrategy.ts
 * 
 * Interface para el Strategy Pattern.
 * Cada arquetipo tiene su propia estrategia de build que puede ser intercambiada dinámicamente.
 * 
 * SOLID Principle: Open/Closed - Abierto a extensión (nuevas estrategias), cerrado a modificación
 */

import type { Item } from '../../../types/item';
import type { GameContext } from '../GameContext';
import type { ItemScore } from '../ItemScorer';

export interface IBuildStrategy {
    /**
     * Nombre de la estrategia (para debugging)
     */
    name: string;

    /**
     * Filtra ítems relevantes para este arquetipo
     * Reduce el espacio de búsqueda antes del scoring
     */
    filterRelevantItems(allItems: Item[], context: GameContext): Item[];

    /**
     * Aplica modificadores específicos de la estrategia al score
     * Permite que cada arquetipo tenga reglas especiales
     */
    applyStrategyModifiers(scoredItems: ItemScore[], context: GameContext): ItemScore[];

    /**
     * Genera recomendaciones específicas del arquetipo
     * (ej: "Evoluciona Q primero" para Kai'Sa)
     */
    getArchetypeSpecificTips(context: GameContext): string[];
}
