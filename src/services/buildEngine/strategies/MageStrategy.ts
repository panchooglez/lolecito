/**
 * MageStrategy.ts
 * 
 * Estrategia de build para Magos.
 * 
 * Del discurso del pro:
 * "Burst vs DPS - Penetración Mágica Plana para Burst (Shadowflame)"
 * "Liandry es obligatorio si el enemigo tiene frontline con HP stackeada"
 * "Battlemages necesitan Haste + Mana/Sustain"
 */

import type { Item } from '../../../types/item';
import type { GameContext } from '../GameContext';
import type { ItemScore } from '../ItemScorer';
import type { IBuildStrategy } from './IBuildStrategy';

export class MageStrategy implements IBuildStrategy {
    name = 'Mage Strategy';

    filterRelevantItems(allItems: Item[], context: GameContext): Item[] {
        return allItems.filter(item => {
            const tags = item.tags;

            const isFinalItem = (item.depth === 3 || item.gold.total > 2500) || tags.includes('Boots');
            const isAvailable = item.maps['11'] === true && item.gold.purchasable;

            const isRelevant =
                tags.includes('SpellDamage') ||
                tags.includes('Mana') ||
                tags.includes('ManaRegen') ||
                tags.includes('CooldownReduction') ||
                tags.includes('Boots') ||
                tags.includes('SpellBlock') || // Para Zhonya, Banshee
                // Permitir anti-curación para mages
                (item.name.includes('Morello') && context.needsGrievousWounds());

            return isFinalItem && isAvailable && isRelevant;
        });
    }

    applyStrategyModifiers(scoredItems: ItemScore[], context: GameContext): ItemScore[] {
        return scoredItems.map(scored => {
            const item = scored.item;
            let modifier = 0;

            // REGLA: "Shadowflame es clave para Burst Mages contra bajo MR"
            if (item.name.includes('Shadowflame') || item.name.includes('Llamasombría')) {
                if (context.isLowMagicResistComposition()) {
                    modifier += 90;
                    scored.breakdown.reasoning.push('🔥 SHADOWFLAME: +90 pts (Enemigos tienen < 50 MR)');
                } else {
                    modifier += 30; // Sigue siendo bueno
                }
            }

            // REGLA: "Liandry es obligatorio si tienen frontline con HP"
            if (item.name.includes('Liandry') || item.name.includes('Tormento')) {
                if (context.isTankHeavyComposition()) {
                    modifier += 95;
                    scored.breakdown.reasoning.push('🔥 LIANDRY: +95 pts (Enemigos tank-heavy, necesitas % HP damage)');
                } else {
                    modifier -= 20; // No tan bueno contra squishies
                }
            }

            // REGLA: Void Staff contra alta resistencia mágica
            if (item.name.includes('Void') || item.name.includes('Vacío')) {
                if (context.enemyComp.averageMagicResist > 60) {
                    modifier += 80;
                    scored.breakdown.reasoning.push('🎯 VOID STAFF: +80 pts (Enemigos con alta MR)');
                }
            }

            // REGLA: Zhonya para supervivencia contra assassins/divers
            if (item.name.includes('Zhonya')) {
                if (context.shouldPrioritizeSurvival()) {
                    modifier += 70;
                    scored.breakdown.reasoning.push('⏱️ ZHONYA: +70 pts (Necesitas surviveability)');
                }
            }

            // REGLA: Battlemages necesitan mana sustain (Archangel)
            if (item.name.includes('Archangel') || item.name.includes('Seraph')) {
                modifier += 40;
                scored.breakdown.reasoning.push('💎 ARCHANGEL: +40 pts (Mana sustain para DPS prolongado)');
            }

            // REGLA: Haste (CDR) es valioso para spam de habilidades
            if (item.tags.includes('CooldownReduction')) {
                modifier += 20;
            }

            scored.totalScore += modifier;
            scored.breakdown.archetypeBonus += modifier;
            return scored;
        });
    }

    getArchetypeSpecificTips(context: GameContext): string[] {
        const tips: string[] = [];

        if (context.isLowMagicResistComposition()) {
            tips.push('🔥 Enemigos tienen bajo MR: Shadowflame es MUY efectivo (Magic Pen plana)');
        }

        if (context.isTankHeavyComposition()) {
            tips.push('🎯 Enemigos tank-heavy: Liandry + Void Staff son mandatorios');
        } else {
            tips.push('💥 Enemigos squishy: Prioriza burst damage (Luden + Shadowflame)');
        }

        if (context.needsGrievousWounds()) {
            tips.push('🩸 Compra Morellonomicon SOLO si hay healing enemigo significativo');
        }

        tips.push('⏱️ Zhonya puede salvarte de dives - compralo si te targetean');

        return tips;
    }
}
