/**
 * ItemScorer.ts
 * 
 * Motor de scoring que evalúa cada ítem basándose en las reglas del jugador profesional.
 * 
 * Filosofía: "Un jugador Challenger no copia una receta; entiende la lógica detrás de cada compra."
 * 
 * Este sistema calcula un score ponderado para cada ítem considerando:
 * - Contexto del juego (oro, tiempo, composición enemiga)
 * - Arquetipo del campeón
 * - Eficiencia de oro
 * - Sinergia con ítems actuales
 */

import type { Item } from '../../types/item';
import { GameContext } from './GameContext';

export interface ItemScore {
    item: Item;
    totalScore: number;
    breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
    baseScore: number;              // Score base por tipo de ítem
    archetypeBonus: number;         // Bonus por match con arquetipo
    counterBonus: number;           // Bonus por counter al enemigo
    goldEfficiency: number;         // Bonus por eficiencia de oro
    powerSpikeBonus: number;        // Bonus por power spike timing
    survivalBonus: number;          // Bonus por necesidad de supervivencia
    penalties: number;              // Penalizaciones
    reasoning: string[];            // Explicación del scoring (para debug)
}

export class ItemScorer {
    /**
     * Evalúa un ítem y devuelve su score basado en el contexto del juego
     */
    static scoreItem(item: Item, context: GameContext): ItemScore {
        const breakdown: ScoreBreakdown = {
            baseScore: 0,
            archetypeBonus: 0,
            counterBonus: 0,
            goldEfficiency: 0,
            powerSpikeBonus: 0,
            survivalBonus: 0,
            penalties: 0,
            reasoning: []
        };

        // === SCORE BASE POR TIPO DE ÍTEM ===
        breakdown.baseScore = this.calculateBaseScore(item);

        // === BONUS POR ARQUETIPO ===
        breakdown.archetypeBonus = this.calculateArchetypeBonus(item, context);

        // === BONUS POR COUNTER A COMPOSICIÓN ENEMIGA ===
        breakdown.counterBonus = this.calculateCounterBonus(item, context);

        // === EFICIENCIA DE ORO (Gold Value) ===
        breakdown.goldEfficiency = this.calculateGoldEfficiency(item, context);

        // === POWER SPIKE TIMING ===
        breakdown.powerSpikeBonus = this.calculatePowerSpikeBonus(item, context);

        // === BONUS DE SUPERVIVENCIA ===
        breakdown.survivalBonus = this.calculateSurvivalBonus(item, context);

        // === PENALIZACIONES ===
        breakdown.penalties = this.calculatePenalties(item, context);

        const totalScore =
            breakdown.baseScore +
            breakdown.archetypeBonus +
            breakdown.counterBonus +
            breakdown.goldEfficiency +
            breakdown.powerSpikeBonus +
            breakdown.survivalBonus -
            breakdown.penalties;

        return {
            item,
            totalScore,
            breakdown
        };
    }

    /**
     * Score base según el tipo de ítem
     */
    private static calculateBaseScore(item: Item): number {
        let score = 50; // Base neutral

        // Ítems finales (depth 3) son generalmente mejores
        if (item.depth === 3) score += 20;

        // Ítems caros suelen ser más impactantes
        if (item.gold.total > 3000) score += 10;

        return score;
    }

    /**
     * REGLA DEL PRO: Cada arquetipo tiene necesidades específicas
     * Ejemplos:
     * - ADC Crit: Necesita Filo Infinito, Crit%, Attack Speed
     * - Mage Burst: Necesita Magic Pen Flat (Shadowflame)
     * - Bruiser: Necesita balance de Daño + Tanque
     */
    private static calculateArchetypeBonus(item: Item, context: GameContext): number {
        let bonus = 0;
        const tags = item.tags;
        const archetype = context.championArchetype;

        switch (archetype) {
            case 'Marksman':
                // REGLA: ADC Crit necesita Crit Chance + Attack Speed + AD
                if (tags.includes('CriticalStrike')) bonus += 40;
                if (tags.includes('AttackSpeed')) bonus += 30;
                if (tags.includes('Damage')) bonus += 25;

                // REGLA: "Filo Infinito es mandatorio como 1º o 2º ítem"
                if (item.name.includes('Infinity') || item.name.includes('Infinito')) {
                    bonus += 60;
                    context.playerState.inventoryValue < 3500 && (bonus += 20); // Prioridad en early
                }
                break;

            case 'Mage':
                // REGLA: Mages necesitan AP + Mana (o Mana Regen)
                if (tags.includes('SpellDamage')) bonus += 40;
                if (tags.includes('Mana') || tags.includes('ManaRegen')) bonus += 25;

                // REGLA: "Shadowflame para Burst Mages"
                if (item.name.includes('Shadowflame') && context.isLowMagicResistComposition()) {
                    bonus += 80; // SUPER EFECTIVO contra bajo MR
                }

                // REGLA: "Liandry es obligatorio si el enemigo tiene frontline con HP stackeada"
                if (item.name.includes('Liandry') && context.isTankHeavyComposition()) {
                    bonus += 70;
                }
                break;

            case 'Fighter':
            case 'Tank':
                // REGLA: Bruisers necesitan daño + HP + resistencias (balance de EHP)
                if (tags.includes('Damage') && tags.includes('Health')) bonus += 50;
                if (tags.includes('Armor') || tags.includes('SpellBlock')) bonus += 30;

                // REGLA: "No sirve de nada tener 4000 HP con 50 armor"
                // Priorizar resistencias si ya tenemos mucho HP
                if (context.playerState.inventoryValue > 4000) {
                    if (tags.includes('Armor') || tags.includes('SpellBlock')) bonus += 40;
                }
                break;

            case 'Assassin':
                // REGLA: Assassins necesitan burst damage puro (no AS, no tanque)
                if (tags.includes('Damage') && !tags.includes('AttackSpeed')) bonus += 50;
                if (item.name.includes('Lethality') || item.name.includes('Penetration')) bonus += 40;
                break;

            case 'Support':
                // Supports necesitan utilidad
                if (tags.includes('ManaRegen') || tags.includes('HealthRegen')) bonus += 40;
                if (item.gold.total < 2600) bonus += 20; // Ítems baratos son mejores
                break;
        }

        return bonus;
    }

    /**
     * REGLA DEL PRO: "¿Quién es la amenaza rival?"
     * Bonus por counter específico a la composición enemiga
     */
    private static calculateCounterBonus(item: Item, context: GameContext): number {
        let bonus = 0;

        // REGLA: "Si el enemigo tiene +2 tanques, prioriza Penetración de Armadura % (Lord Dominik)"
        if (context.isTankHeavyComposition()) {
            if (item.name.includes('Dominik') || item.name.includes('Recuerdo')) {
                bonus += 100; // CRÍTICO contra tanques
                context.reasoning?.push("⚔️ LORD DOMINIK: +100 pts (Enemigos tienen 2+ tanques, necesitas Armor Pen %)");
            }
            // Penetración mágica para mages
            if (item.name.includes('Void') || item.name.includes('Vacío')) {
                bonus += 80;
            }
        }

        // REGLA: "Si vas contra Aatrox/Soraka, compra Grievous Wounds"
        if (context.needsGrievousWounds()) {
            if (item.description.includes('Grievous') ||
                item.name.includes('Executioner') ||
                item.name.includes('Mortal') ||
                item.name.includes('Recordatorio') ||
                item.description.includes('Wounds')) {
                bonus += 120; // MÁXIMA PRIORIDAD
                context.reasoning?.push("🩸 ANTI-CURACIÓN: +120 pts (Enemigos tienen campeones con healing)");
            }
        }

        // REGLA: "Tabis si 2+ autoatacantes enemigos"
        if (context.isAutoAttackHeavy()) {
            if (item.name.includes('Plated') || item.name.includes('Steelcaps') || item.name.includes('Tabi')) {
                bonus += 90;
                context.reasoning?.push("🛡️ TABIS: +90 pts (Enemigos tienen 2+ autoatacantes)");
            }
        }

        // REGLA: "Botas de Mercurio por tenacidad si hay CC duro"
        if (context.needsTenacity()) {
            if (item.name.includes('Mercury')) {
                bonus += 90;
                context.reasoning?.push("⚡ MERCURY: +90 pts (Enemigos tienen mucho CC duro)");
            }
        }

        return bonus;
    }

    /**
     * Calcula eficiencia de oro del ítem
     * (Basado en valor de stats vs costo)
     */
    private static calculateGoldEfficiency(item: Item, _context: GameContext): number {
        // Simplificado: ítems baratos con buenas stats son eficientes
        if (item.gold.total < 1000 && Object.keys(item.stats).length > 2) {
            return 20; // Componentes eficientes
        }

        // Ítems míticos/legendarios caros
        if (item.gold.total > 2800) {
            return 15;
        }

        return 0;
    }

    /**
     * REGLA DEL PRO: "Costo de Oportunidad - Si no tienes 1300g para Espadón, compra AS"
     * Evalúa si el ítem se alinea con nuestro timing de power spike
     */
    private static calculatePowerSpikeBonus(item: Item, context: GameContext): number {
        let bonus = 0;

        // REGLA: Si no podemos pagar el ítem caro, priorizar componentes eficientes
        if (!context.canAffordExpensiveItem(item.gold.total) && item.depth && item.depth < 3) {
            bonus += 40;
            context.reasoning?.push(`💰 Componente eficiente: +40 pts (No tienes oro para ítem final, mejor tempo)`);
        }

        // REGLA: Si estamos en early game, priorizar ítems míticos/core
        if (context.isEarlyGame() && item.depth === 3 && item.gold.total > 3000) {
            bonus += 50;
        }

        return bonus;
    }

    /**
     * REGLA DEL PRO: Si vas perdiendo, necesitas sobrevivir
     */
    private static calculateSurvivalBonus(item: Item, context: GameContext): number {
        let bonus = 0;

        if (context.shouldPrioritizeSurvival()) {
            // Priorizar defensivos
            if (item.tags.includes('Health') || item.tags.includes('Armor') || item.tags.includes('SpellBlock')) {
                bonus += 60;
            }

            // Reloj de Zhonya para surviveability
            if (item.name.includes('Zhonya') || item.name.includes('Stopwatch')) {
                bonus += 70;
            }
        }

        return bonus;
    }

    /**
     * REGLA DEL PRO: "Nunca retrases tu mítico por componentes defensivos tier 2"
     * Penalizaciones por compras subóptimas
     */
    private static calculatePenalties(item: Item, context: GameContext): number {
        let penalty = 0;

        // PENALIZACIÓN: No comprar componentes defensivos tier 2 en early game
        if (context.isEarlyGame() &&
            context.playerState.inventoryValue < 3000 &&
            item.depth === 2 &&
            (item.tags.includes('Armor') || item.tags.includes('SpellBlock')) &&
            !item.tags.includes('Damage')) {
            penalty += 50;
            context.reasoning?.push("⚠️ PENALIZACIÓN: -50 pts (No retrases tu mítico con componentes defensivos)");
        }

        // PENALIZACIÓN: No comprar Morellonomicon si no hay healing
        if (item.name.includes('Morello') && context.enemyComp.healingChampions === 0) {
            penalty += 40;
        }

        // PENALIZACIÓN: Duplicar tipo de bota (ya tienes botas)
        if (item.tags.includes('Boots') && context.playerState.currentItems.some(i => i.includes('Boots'))) {
            penalty += 200; // Invalidar
        }

        return penalty;
    }

    /**
     * Ordena ítems por score descendente
     */
    static rankItems(scoredItems: ItemScore[]): ItemScore[] {
        return scoredItems.sort((a, b) => b.totalScore - a.totalScore);
    }
}

/**
 * Extensión de GameContext para agregar reasoning
 */
declare module './GameContext' {
    interface GameContext {
        reasoning?: string[];
    }
}
