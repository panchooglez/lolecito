/**
 * BruiserStrategy.ts
 * 
 * Estrategia de build para Fighters/Bruisers.
 * 
 * Del discurso del pro:
 * "EHP (Effective Health Points) = HP × (1 + Armor/100)"
 * "No sirve de nada tener 4000 HP si tienes 50 armor"
 * "Generalmente 2 ítems de daño + transición a tanque"
 * "Cuchilla Negra es fundamental por la reducción de armadura que beneficia al ADC"
 */

import type { Item } from '../../../types/item';
import type { GameContext } from '../GameContext';
import type { ItemScore } from '../ItemScorer';
import type { IBuildStrategy } from './IBuildStrategy';

export class BruiserStrategy implements IBuildStrategy {
    name = 'Bruiser/Fighter Strategy';

    filterRelevantItems(allItems: Item[], _context: GameContext): Item[] {
        return allItems.filter(item => {
            const tags = item.tags;

            const isFinalItem = (item.depth === 3 || item.gold.total > 2500) || tags.includes('Boots');
            const isAvailable = item.maps['11'] === true && item.gold.purchasable;

            // Bruisers quieren: Daño + HP + Resistencias
            const isRelevant =
                tags.includes('Damage') ||
                tags.includes('Health') ||
                tags.includes('Armor') ||
                tags.includes('SpellBlock') ||
                tags.includes('Boots') ||
                tags.includes('LifeSteal') ||
                tags.includes('AbilityHaste') ||
                item.description.includes('Grievous');

            return isFinalItem && isAvailable && isRelevant;
        });
    }

    applyStrategyModifiers(scoredItems: ItemScore[], context: GameContext): ItemScore[] {
        return scoredItems.map(scored => {
            const item = scored.item;
            let modifier = 0;

            // REGLA: "Cuchilla Negra es fundamental"
            if (item.name.includes('Black Cleaver') || item.name.includes('Cuchilla')) {
                modifier += 70;
                scored.breakdown.reasoning.push('⚔️ CUCHILLA NEGRA: +70 pts (Shred de armor beneficia al equipo)');
            }

            // REGLA: Balance de EHP - Priorizar resistencias si ya tenemos HP
            const hasHealthAlready = context.playerState.inventoryValue > 3500;
            if (hasHealthAlready) {
                if (item.tags.includes('Armor') || item.tags.includes('SpellBlock')) {
                    modifier += 50;
                    scored.breakdown.reasoning.push('🛡️ RESISTENCIAS: +50 pts (Necesitas armor/MR para balancear tu HP)');
                }
                // Penalizar HP puro sin resistencias
                if (item.tags.includes('Health') &&
                    !item.tags.includes('Armor') &&
                    !item.tags.includes('SpellBlock')) {
                    modifier -= 30;
                }
            } else {
                // Early game: priorizar HP + Daño (híbridos como Sterak, Stridebreaker)
                if (item.tags.includes('Damage') && item.tags.includes('Health')) {
                    modifier += 60;
                    scored.breakdown.reasoning.push('💪 HÍBRIDO: +60 pts (Daño + HP es ideal para bruisers)');
                }
            }

            // REGLA: Sterak para surviveability en teamfights
            if (item.name.includes('Sterak')) {
                modifier += 50;
                scored.breakdown.reasoning.push('💥 STERAK: +50 pts (Shield en teamfights)');
            }

            // REGLA: Ability Haste es valioso para bruisers (spam abilities)
            if (item.tags.includes('AbilityHaste') || item.tags.includes('CooldownReduction')) {
                modifier += 25;
            }

            // REGLA: Anti-curación si es necesario
            if (context.needsGrievousWounds() && item.description.includes('Grievous')) {
                modifier += 100;
            }

            scored.totalScore += modifier;
            scored.breakdown.archetypeBonus += modifier;
            return scored;
        });
    }

    getArchetypeSpecificTips(context: GameContext): string[] {
        const tips: string[] = [];

        tips.push('⚔️ Como bruiser: compra 2 ítems de daño primero, luego transiciona a tanque');
        tips.push('🛡️ IMPORTANTE: Balancea HP con resistencias (no stackees solo HP)');
        tips.push('💪 Cuchilla Negra es core - el shred de armor ayuda a todo tu equipo');

        if (context.enemyComp.tankCount >= 1) {
            tips.push('🎯 Hay tanques enemigos: Cuchilla Negra es MANDATORIA');
        }

        if (context.needsGrievousWounds()) {
            tips.push('🩸 Compra Grievous Wounds contra healing enemigo');
        }

        if (context.playerState.inventoryValue > 4000) {
            tips.push('📊 Ya tienes HP: prioriza RESISTENCIAS (armor/MR) para maximizar EHP');
        }

        return tips;
    }
}
