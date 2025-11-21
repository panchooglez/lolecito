/**
 * GameContext.ts
 * 
 * Representa el contexto completo del juego en un momento dado.
 * Basado en la filosofía del jugador pro: "Tu build debe responder a tres preguntas:
 * 1. ¿Cuál es mi Win Condition?
 * 2. ¿Quién es la amenaza rival?
 * 3. ¿Cuál es mi Breakpoint?"
 */

export enum WinCondition {
    SPLITPUSH = 'SPLITPUSH',
    TEAMFIGHT = 'TEAMFIGHT',
    PICKOFF = 'PICKOFF',
    SCALING = 'SCALING'
}

export enum ThreatType {
    MAGIC_BURST = 'MAGIC_BURST',           // Syndra, LeBlanc
    MAGIC_DPS = 'MAGIC_DPS',               // Cassiopeia, Azir
    PHYSICAL_BURST = 'PHYSICAL_BURST',      // Zed, Talon
    PHYSICAL_SUSTAINED = 'PHYSICAL_SUSTAINED', // ADCs, Tryndamere
    TANK_HEAVY = 'TANK_HEAVY',             // +2 tanques en el equipo enemigo
    HEALING_HEAVY = 'HEALING_HEAVY'        // Aatrox, Soraka, etc.
}

export interface EnemyComposition {
    tankCount: number;              // Número de tanques enemigos
    autoAttackerCount: number;      // Número de campeones con AA como fuente principal
    hardCCCount: number;            // Cantidad de CC duro (stuns, roots)
    healingChampions: number;       // Campeones con curación significativa
    averageMagicResist: number;     // MR promedio del equipo enemigo
    averageArmor: number;           // Armadura promedio
    mainThreats: ThreatType[];      // Amenazas principales identificadas
}

export interface PlayerState {
    currentGold: number;            // Oro actual disponible
    inventoryValue: number;         // Valor total del inventario actual
    gameTime: number;               // Tiempo de juego en minutos
    isAhead: boolean;               // ¿Estamos ganando? (snowballing)
    isBehind: boolean;              // ¿Estamos perdiendo? (necesitamos survival)
    hasGrievousWounds: boolean;     // ¿Ya tenemos anti-curación?
    currentItems: string[];         // IDs de ítems actuales
}

/**
 * Contexto completo del juego que se usa para evaluar builds
 */
export class GameContext {
    winCondition: WinCondition;
    enemyComp: EnemyComposition;
    playerState: PlayerState;
    championArchetype: string;      // 'Marksman', 'Mage', 'Fighter', etc.
    gameTime!: number;

    constructor(
        winCondition: WinCondition,
        enemyComp: EnemyComposition,
        playerState: PlayerState,
        championArchetype: string
    ) {
        this.winCondition = winCondition;
        this.enemyComp = enemyComp;
        this.playerState = playerState;
        this.championArchetype = championArchetype;
    }

    /**
     * REGLA DEL PRO: "Si el equipo enemigo tiene +2 tanques..."
     * Determina si la composición enemiga es tank-heavy
     */
    isTankHeavyComposition(): boolean {
        return this.enemyComp.tankCount >= 2;
    }

    /**
     * REGLA DEL PRO: "Tabis si el equipo tiene 2+ autoatacantes"
     */
    isAutoAttackHeavy(): boolean {
        return this.enemyComp.autoAttackerCount >= 2;
    }

    /**
     * REGLA DEL PRO: "Shadowflame es mejor cuanto menos MR tiene el enemigo"
     * Determina si los enemigos tienen baja resistencia mágica (< 50 MR base)
     */
    isLowMagicResistComposition(): boolean {
        return this.enemyComp.averageMagicResist < 50;
    }

    /**
     * REGLA DEL PRO: "Si vas contra un Aatrox o Soraka, compra el maldito Grievous Wounds"
     */
    needsGrievousWounds(): boolean {
        return this.enemyComp.healingChampions >= 1 && !this.playerState.hasGrievousWounds;
    }

    /**
     * REGLA DEL PRO: "Botas de Mercurio por la tenacidad si hay CC duro"
     */
    needsTenacity(): boolean {
        return this.enemyComp.hardCCCount >= 2;
    }

    /**
     * Determina si estamos en early game (fase de líneas)
     * Importante para la regla: "No retrases tu mítico por componentes defensivos"
     */
    isEarlyGame(): boolean {
        return this.gameTime < 15;
    }

    /**
     * Determina si estamos en mid game (fase de agrupación)
     */
    isMidGame(): boolean {
        return this.gameTime >= 15 && this.gameTime < 30;
    }

    /**
     * Determina si estamos en late game (full build)
     */
    isLateGame(): boolean {
        return this.gameTime >= 30;
    }

    /**
     * REGLA DEL PRO: "Costo de Oportunidad - Si no tienes 1300g para Espadón..."
     * Verifica si podemos permitirnos un ítem completo o debemos comprar componentes
     */
    canAffordExpensiveItem(itemCost: number): boolean {
        return this.playerState.currentGold >= itemCost * 0.85; // 85% del costo
    }

    /**
     * Prioridad de snowball: cuando vas ganando, maximiza daño
     */
    shouldPrioritizeDamage(): boolean {
        return this.playerState.isAhead || this.winCondition === WinCondition.PICKOFF;
    }

    /**
     * Prioridad de supervivencia: cuando vas perdiendo, necesitas sobrevivir
     */
    shouldPrioritizeSurvival(): boolean {
        return this.playerState.isBehind;
    }
}

/**
 * Factory para crear contextos de juego simplificados para testing/demo
 */
export class GameContextFactory {
    /**
     * Crea un contexto genérico basado solo en el campeón
     * (para cuando no tenemos información detallada del juego)
     */
    static createDefaultContext(
        championArchetype: string,
        currentGold: number = 5000
    ): GameContext {
        return new GameContext(
            WinCondition.TEAMFIGHT,
            {
                tankCount: 1,
                autoAttackerCount: 1,
                hardCCCount: 1,
                healingChampions: 0,
                averageMagicResist: 40,
                averageArmor: 60,
                mainThreats: []
            },
            {
                currentGold,
                inventoryValue: 0,
                gameTime: 20,
                isAhead: false,
                isBehind: false,
                hasGrievousWounds: false,
                currentItems: []
            },
            championArchetype
        );
    }

    /**
     * Crea un contexto contra un equipo tank-heavy
     * (Demuestra la regla de penetración de armadura)
     */
    static createVsTanksContext(championArchetype: string): GameContext {
        return new GameContext(
            WinCondition.TEAMFIGHT,
            {
                tankCount: 3, // +2 tanques → REGLA: Priorizar Armor Pen
                autoAttackerCount: 1,
                hardCCCount: 2,
                healingChampions: 0,
                averageMagicResist: 60,
                averageArmor: 120,
                mainThreats: [ThreatType.TANK_HEAVY]
            },
            {
                currentGold: 6000,
                inventoryValue: 4000,
                gameTime: 25,
                isAhead: false,
                isBehind: false,
                hasGrievousWounds: false,
                currentItems: []
            },
            championArchetype
        );
    }

    /**
     * Crea un contexto contra un equipo con mucha curación
     * (Demuestra la regla de Grievous Wounds)
     */
    static createVsHealingContext(championArchetype: string): GameContext {
        return new GameContext(
            WinCondition.TEAMFIGHT,
            {
                tankCount: 1,
                autoAttackerCount: 2,
                hardCCCount: 1,
                healingChampions: 2, // → REGLA: Compra Grievous Wounds AHORA
                averageMagicResist: 45,
                averageArmor: 70,
                mainThreats: [ThreatType.HEALING_HEAVY]
            },
            {
                currentGold: 800,
                inventoryValue: 3000,
                gameTime: 12,
                isAhead: false,
                isBehind: false,
                hasGrievousWounds: false,
                currentItems: []
            },
            championArchetype
        );
    }
}
