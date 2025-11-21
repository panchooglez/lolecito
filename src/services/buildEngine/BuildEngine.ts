/**
 * BuildEngine.ts
 * 
 * Motor principal que orquesta todo el sistema de builds.
 * Utiliza Strategy Pattern para seleccionar la estrategia correcta según el campeón.
 * 
 * Filosofía del Pro: "Un jugador Challenger no copia una receta; entiende la lógica detrás de cada compra"
 * 
 * Este engine NUNCA devuelve builds estáticas. Todo es calculado en tiempo real basado en contexto.
 */

import type { Item } from '../../types/item';
import type { Champion } from '../../types/champion';
import { GameContext, GameContextFactory } from './GameContext';
import { ItemScorer, type ItemScore } from './ItemScorer';
import type { IBuildStrategy } from './strategies/IBuildStrategy';
import { ADCStrategy } from './strategies/ADCStrategy';
import { MageStrategy } from './strategies/MageStrategy';
import { BruiserStrategy } from './strategies/BruiserStrategy';

export interface BuildRecommendation {
    coreItems: Item[];
    boots: Item[];
    situationalItems: Item[];
    tips: string[];
    reasoning: string[];
}

export class BuildEngine {
    private strategies: Map<string, IBuildStrategy>;

    constructor() {
        this.strategies = new Map();
        this.registerStrategies();
    }

    /**
     * Registra todas las estrategias disponibles
     * SOLID: Open/Closed - Para agregar nueva estrategia, solo agregala aquí
     */
    private registerStrategies(): void {
        this.strategies.set('Marksman', new ADCStrategy());
        this.strategies.set('Mage', new MageStrategy());
        this.strategies.set('Fighter', new BruiserStrategy());
        this.strategies.set('Tank', new BruiserStrategy()); // Tanks usan lógica similar
        // TODO: Agregar AssassinStrategy, SupportStrategy según necesidad

        // Fallback strategy (usa lógica de bruiser por defecto)
        this.strategies.set('default', new BruiserStrategy());
    }

    /**
     * Obtiene la estrategia correcta para el campeón
     */
    private getStrategy(champion: Champion): IBuildStrategy {
        const primaryRole = champion.tags[0]; // Rol principal
        return this.strategies.get(primaryRole) || this.strategies.get('default')!;
    }

    /**
     * MÉTODO PRINCIPAL: Genera recomendaciones de build
     * 
     * @param champion - El campeón para el cual generar la build
     * @param allItems - Todos los ítems disponibles en el juego
     * @param context - Contexto del juego (opcional, se genera uno por defecto)
     * @returns Recomendación completa de build
     */
    generateBuild(
        champion: Champion,
        allItems: Item[],
        context?: GameContext
    ): BuildRecommendation {
        // Si no hay contexto, crear uno por defecto
        const gameContext = context || GameContextFactory.createDefaultContext(champion.tags[0]);

        // Inicializar array de reasoning
        gameContext.reasoning = [];

        // Obtener la estrategia correcta para este campeón
        const strategy = this.getStrategy(champion);

        // PASO 1: Filtrar ítems relevantes (reduce espacio de búsqueda)
        const relevantItems = strategy.filterRelevantItems(allItems, gameContext);

        // PASO 2: Separar botas de ítems normales
        const boots = relevantItems.filter(item => item.tags.includes('Boots'));
        const nonBootItems = relevantItems.filter(item => !item.tags.includes('Boots'));

        // PASO 3: Calcular score para cada ítem usando ItemScorer
        const scoredItems = nonBootItems.map(item =>
            ItemScorer.scoreItem(item, gameContext)
        );

        // PASO 4: Aplicar modificadores específicos de la estrategia
        const modifiedScores = strategy.applyStrategyModifiers(scoredItems, gameContext);

        // PASO 5: Ordenar por score descendente
        const rankedItems = ItemScorer.rankItems(modifiedScores);

        // PASO 6: Calcular score para botas
        const scoredBoots = boots.map(boot =>
            ItemScorer.scoreItem(boot, gameContext)
        );
        const rankedBoots = ItemScorer.rankItems(scoredBoots);

        // PASO 7: Seleccionar top ítems
        const coreItems = rankedItems.slice(0, 6).map(scored => scored.item);
        const topBoots = rankedBoots.slice(0, 3).map(scored => scored.item);
        const situationalItems = rankedItems.slice(6, 10).map(scored => scored.item);

        // PASO 8: Generar tips específicos del arquetipo
        const tips = strategy.getArchetypeSpecificTips(gameContext);

        // PASO 9: Extraer reasoning de los top ítems
        const reasoning = this.extractTopReasoning(rankedItems.slice(0, 6), gameContext);

        return {
            coreItems,
            boots: topBoots,
            situationalItems,
            tips,
            reasoning
        };
    }

    /**
     * Genera build contra una composición específica (para demos)
     */
    generateBuildVsTanks(champion: Champion, allItems: Item[]): BuildRecommendation {
        const context = GameContextFactory.createVsTanksContext(champion.tags[0]);
        return this.generateBuild(champion, allItems, context);
    }

    /**
     * Genera build contra equipo con mucha curación
     */
    generateBuildVsHealing(champion: Champion, allItems: Item[]): BuildRecommendation {
        const context = GameContextFactory.createVsHealingContext(champion.tags[0]);
        return this.generateBuild(champion, allItems, context);
    }

    /**
     * Extrae el reasoning de los ítems mejor rankeados
     */
    private extractTopReasoning(topItems: ItemScore[], context: GameContext): string[] {
        const reasoning: string[] = [];

        // Agregar reasoning global del contexto
        if (context.reasoning && context.reasoning.length > 0) {
            reasoning.push(...context.reasoning);
        }

        // Agregar reasoning de cada ítem top
        topItems.forEach((scored, index) => {
            if (scored.breakdown.reasoning.length > 0) {
                reasoning.push(`${index + 1}. ${scored.item.name}:`);
                reasoning.push(...scored.breakdown.reasoning);
            }
        });

        // Deduplicar
        return [...new Set(reasoning)];
    }

    /**
     * Método de debug: muestra el desglose completo de scoring
     */
    debugItemScoring(champion: Champion, allItems: Item[], itemName: string): void {
        const context = GameContextFactory.createDefaultContext(champion.tags[0]);
        const item = allItems.find(i => i.name.includes(itemName));

        if (!item) {
            console.error(`Item "${itemName}" not found`);
            return;
        }

        const scored = ItemScorer.scoreItem(item, context);

        console.log(`\n=== DEBUG: ${item.name} ===`);
        console.log(`Total Score: ${scored.totalScore}`);
        console.log('\nBreakdown:');
        console.log(`  Base Score: ${scored.breakdown.baseScore}`);
        console.log(`  Archetype Bonus: ${scored.breakdown.archetypeBonus}`);
        console.log(`  Counter Bonus: ${scored.breakdown.counterBonus}`);
        console.log(`  Gold Efficiency: ${scored.breakdown.goldEfficiency}`);
        console.log(`  Power Spike: ${scored.breakdown.powerSpikeBonus}`);
        console.log(`  Survival: ${scored.breakdown.survivalBonus}`);
        console.log(`  Penalties: ${scored.breakdown.penalties}`);

        if (scored.breakdown.reasoning.length > 0) {
            console.log('\nReasoning:');
            scored.breakdown.reasoning.forEach(r => console.log(`  ${r}`));
        }
    }
}

/**
 * Singleton instance para uso global
 */
export const buildEngine = new BuildEngine();
