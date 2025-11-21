/**
 * ADCStrategy.ts
 * 
 * Estrategia de build para Tiradores (Marksman).
 * 
 * Del discurso del pro:
 * "Todo se reduce a multiplicar: AD × Attack Speed × Crit Chance × Crit Damage"
 * "Filo Infinito es mandatorio como 1º o 2º ítem"
 * "Si tienen +2 tanques, prioriza Penetración de Armadura % antes del cuarto ítem"
 */

import type { Item } from '../../../types/item';
import type { GameContext } from '../GameContext';
import type { ItemScore } from '../ItemScorer';
import type { IBuildStrategy } from './IBuildStrategy';

export class ADCStrategy implements IBuildStrategy {
    name = 'ADC Strategy';

    filterRelevantItems(allItems: Item[], _context: GameContext): Item[] {
        return allItems.filter(item => {
            const tags = item.tags;

            // Solo ítems finales (depth 3) o botas
            const isFinalItem = (item.depth === 3 || item.gold.total > 2500) || tags.includes('Boots');

            // Debe estar disponible en Summoner's Rift (mapa 11)
            const isAvailable = item.maps['11'] === true && item.gold.purchasable;

            // Debe ser relevante para ADC
            const isRelevant =
                tags.includes('Damage') ||
                tags.includes('CriticalStrike') ||
                tags.includes('AttackSpeed') ||
                tags.includes('LifeSteal') ||
                tags.includes('Boots') ||
                tags.includes('OnHit') ||
                // Permitir algunos ítems defensivos situacionales
                (tags.includes('Armor') && item.name.includes('Guardian')) ||
                // Permitir anti-curación
                item.description.includes('Grievous');

            return isFinalItem && isAvailable && isRelevant;
        });
    }

    applyStrategyModifiers(scoredItems: ItemScore[], context: GameContext): ItemScore[] {
        return scoredItems.map(scored => {
            const item = scored.item;
            let modifier = 0;

            // REGLA: "Filo Infinito es mandatorio como 1º o 2º ítem"
            if (item.name.includes('Infinity') || item.name.includes('Infinito')) {
                modifier += 80;
                scored.breakdown.reasoning.push('⭐ FILO INFINITO: +80 pts (Mandatorio para ADC Crit)');
            }

            // REGLA: "Si tienen +2 tanques, Lord Dominik antes del cuarto ítem"
            if (context.isTankHeavyComposition()) {
                if (item.name.includes('Dominik') || item.name.includes('Lord')) {
                    modifier += 100;
                    scored.breakdown.reasoning.push('🎯 LORD DOMINIK: +100 pts (Counter a composición tank-heavy)');
                }
                // Penalizar ítems de puro crit sin penetración
                if (item.tags.includes('CriticalStrike') &&
                    !item.name.includes('Dominik') &&
                    !item.name.includes('Infinity')) {
                    modifier -= 30;
                }
            } else {
                // REGLA: Si NO hay tanques, maximizar crítico y AS
                if (item.tags.includes('CriticalStrike') && item.tags.includes('AttackSpeed')) {
                    modifier += 40;
                    scored.breakdown.reasoning.push('💥 Crit + AS: +40 pts (Maximizar DPS contra squishies)');
                }
            }

            // REGLA: Priorizar ítems con LifeSteal para sustain
            if (item.tags.includes('LifeSteal')) {
                modifier += 25;
            }

            scored.totalScore += modifier;
            scored.breakdown.archetypeBonus += modifier;
            return scored;
        });
    }

    getArchetypeSpecificTips(context: GameContext): string[] {
        const tips: string[] = [];

        tips.push('🎯 Prioriza Filo Infinito como 1º o 2º ítem para maximizar daño crítico');

        if (context.isTankHeavyComposition()) {
            tips.push('⚔️ Enemigos tienen tanques: compra Lord Dominik (Armor Pen %) antes del 4º ítem');
        } else {
            tips.push('💨 Enemigos squishy: Maximiza Crit Chance (60%+) y Attack Speed');
        }

        if (context.isAutoAttackHeavy()) {
            tips.push('🛡️ Enemigos tienen autoatacantes: considera Botas Blindadas (Tabis)');
        }

        if (context.needsGrievousWounds()) {
            tips.push('🩸 URGENTE: Compra Grievous Wounds (Recordatorio Mortal) - hay healing enemigo');
        }

        return tips;
    }
}
