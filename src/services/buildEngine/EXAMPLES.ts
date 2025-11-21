/**
 * EJEMPLO DE USO DEL BUILD ENGINE
 * 
 * Este archivo demuestra cómo usar el nuevo sistema de builds
 * para generar recomendaciones contextuales.
 */

import { buildEngine } from './BuildEngine';
import { GameContextFactory, GameContext, WinCondition } from './GameContext';
import type { Champion } from '../../types/champion';
import type { Item } from '../../types/item';
import { getChampion, getItems } from '../../services/dataService';

/**
 * EJEMPLO 1: Build Básica (Contexto por Defecto)
 * 
 * Usa esto cuando no tienes información específica del juego actual.
 * El engine creará un contexto "genérico" balanceado.
 */
export function ejemplo1_BuildBasica(champion: Champion, allItems: Item[]) {
    console.log('=== EJEMPLO 1: Build Básica ===\n');

    const recommendation = buildEngine.generateBuild(champion, allItems);

    console.log(`Build para: ${champion.name} (${champion.tags[0]})`);
    console.log(`\nCore Items (${recommendation.coreItems.length}):`);
    recommendation.coreItems.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.name} (${item.gold.total}g)`);
    });

    console.log(`\nBoots (${recommendation.boots.length}):`);
    recommendation.boots.forEach((boot, i) => {
        console.log(`  ${i + 1}. ${boot.name}`);
    });

    console.log(`\nStrategy Tips:`);
    recommendation.tips.forEach(tip => console.log(`  ${tip}`));
}

/**
 * EJEMPLO 2: Build Contra Composición Tank-Heavy
 * 
 * Demuestra cómo el sistema prioriza penetración de armadura
 * cuando el enemigo tiene muchos tanques.
 */
export function ejemplo2_BuildContraTanques(champion: Champion, allItems: Item[]) {
    console.log('\n=== EJEMPLO 2: Build Contra Tanques ===\n');

    // Crear contexto específico para enfrentar tanques
    const tankContext = GameContextFactory.createVsTanksContext(champion.tags[0]);

    const recommendation = buildEngine.generateBuild(champion, allItems, tankContext);

    console.log(`Build para: ${champion.name} vs equipo con 3 tanques`);
    console.log(`\nCore Items:`);
    recommendation.coreItems.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.name}`);
        // Nota: Lord Dominik debería aparecer priorizadoen ADCs
    });

    console.log(`\nStrategy Tips:`);
    recommendation.tips.forEach(tip => console.log(`  ${tip}`));
}

/**
 * EJEMPLO 3: Build Contra Healing Excesivo
 * 
 * Demuestra cómo el sistema prioriza Grievous Wounds
 * cuando hay campeones con mucha curación.
 */
export function ejemplo3_BuildContraHealing(champion: Champion, allItems: Item[]) {
    console.log('\n=== EJEMPLO 3: Build Contra Healing ===\n');

    const healingContext = GameContextFactory.createVsHealingContext(champion.tags[0]);

    const recommendation = buildEngine.generateBuild(champion, allItems, healingContext);

    console.log(`Build para: ${champion.name} vs equipo con Aatrox + Soraka`);
    console.log(`\nCore Items:`);
    recommendation.coreItems.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.name}`);
        // Nota: Debería aparecer un ítem con Grievous Wounds priorizado
    });

    console.log(`\nStrategy Tips:`);
    recommendation.tips.forEach(tip => console.log(`  ${tip}`));
}

/**
 * EJEMPLO 4: Contexto Personalizado Completo
 * 
 * Demuestra cómo crear un contexto totalmente customizado
 * para situaciones específicas.
 */
export function ejemplo4_ContextoPersonalizado(champion: Champion, allItems: Item[]) {
    console.log('\n=== EJEMPLO 4: Contexto Personalizado ===\n');

    // Crear un contexto MUY específico
    const customContext = new GameContext(
        WinCondition.TEAMFIGHT,  // Win condition: Teamfights
        {
            tankCount: 2,
            autoAttackerCount: 3,        // ¡3 autoatacantes! → Tabis recomendado
            hardCCCount: 3,              // Mucho CC → Mercury también válido
            healingChampions: 1,          // 1 healer → Grievous Wounds necesario
            averageMagicResist: 35,       // Bajo MR → Shadowflame efectivo para mages
            averageArmor: 80,
            mainThreats: []
        },
        {
            currentGold: 2800,            // Oro suficiente para ítem completo
            inventoryValue: 6000,         // Ya tenemos algo de build
            gameTime: 22,                 // Mid game
            isAhead: true,                // ¡Vamos ganando! → Priorizar daño
            isBehind: false,
            hasGrievousWounds: false,     // NO tenemos anti-curación aún
            currentItems: ['3006']        // Ya tenemos Botas de Berserker (ID ficticio)
        },
        champion.tags[0]
    );

    const recommendation = buildEngine.generateBuild(champion, allItems, customContext);

    console.log(`Build para: ${champion.name}`);
    console.log(`Contexto: Mid game (22 min), Ganando, vs 3 autoatacantes + 1 healer`);
    console.log(`\nCore Items:`);
    recommendation.coreItems.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.name}`);
    });

    console.log(`\nBoots:`);
    recommendation.boots.forEach(boot => {
        console.log(`  - ${boot.name}`);
        // Nota: Tabis debería tener alta prioridad por los autoatacantes
    });

    console.log(`\nStrategy Tips:`);
    recommendation.tips.forEach(tip => console.log(`  ${tip}`));
}

/**
 * EJEMPLO 5: Debugging de un Ítem Específico
 * 
 * Útil para entender POR QUÉ un ítem tiene alto/bajo score
 */
export function ejemplo5_DebuggingItem(champion: Champion, allItems: Item[]) {
    console.log('\n=== EJEMPLO 5: Debugging de Ítem ===\n');

    // Ver el desglose completo de scoring para "Lord Dominik"
    buildEngine.debugItemScoring(champion, allItems, 'Dominik');

    // Ver otro ítem para comparar
    buildEngine.debugItemScoring(champion, allItems, 'Infinity');
}

/**
 * EJEMPLO 6: Comparación de Builds según Contexto
 * 
 * Demuestra cómo la misma champ puede tener builds MUY diferentes
 * dependiendo del contexto del juego.
 */
export function ejemplo6_ComparacionContextos(champion: Champion, allItems: Item[]) {
    console.log('\n=== EJEMPLO 6: Comparación de Contextos ===\n');

    // Build 1: Contexto genérico
    const build1 = buildEngine.generateBuild(champion, allItems);

    // Build 2: Contra tanques
    const tankContext = GameContextFactory.createVsTanksContext(champion.tags[0]);
    const build2 = buildEngine.generateBuild(champion, allItems, tankContext);

    // Build 3: Contra healing
    const healingContext = GameContextFactory.createVsHealingContext(champion.tags[0]);
    const build3 = buildEngine.generateBuild(champion, allItems, healingContext);

    console.log(`${champion.name} - Comparación de Builds\n`);

    console.log('BUILD 1 (Genérica):');
    console.log('  Core:', build1.coreItems.map(i => i.name).slice(0, 3).join(', '));

    console.log('\nBUILD 2 (Vs Tanques):');
    console.log('  Core:', build2.coreItems.map(i => i.name).slice(0, 3).join(', '));
    console.log('  → Nota: Debería incluir Lord Dominik o Void Staff');

    console.log('\nBUILD 3 (Vs Healing):');
    console.log('  Core:', build3.coreItems.map(i => i.name).slice(0, 3).join(', '));
    console.log('  → Nota: Debería incluir Grievous Wounds temprano');

    // Calcular % de diferencia
    const itemsEnComun = build1.coreItems.filter(item1 =>
        build2.coreItems.some(item2 => item2.name === item1.name)
    ).length;

    console.log(`\n📊 Diferencia: ${6 - itemsEnComun}/6 ítems cambiaron entre Build 1 y 2`);
    console.log('Esto demuestra que el sistema SÍ adapta las builds al contexto.');
}

/**
 * EJEMPLO DE USO EN REACT COMPONENT
 */
/*
function ChampionBuildDisplay({ champion, items }: Props) {
    // Opción 1: Build por defecto
    const defaultBuild = buildEngine.generateBuild(champion, items);
    
    // Opción 2: Build con contexto customizado
    const [gameContext, setGameContext] = useState(() => 
        GameContextFactory.createDefaultContext(champion.tags[0])
    );
    
    const contextualBuild = buildEngine.generateBuild(champion, items, gameContext);
    
    // Permitir al usuario ajustar el contexto
    const handleEnemyCompositionChange = (enemyComp: EnemyComposition) => {
        const newContext = new GameContext(
            gameContext.winCondition,
            enemyComp,  // ← Usuario selecciona si hay tanques, healing, etc.
            gameContext.playerState,
            champion.tags[0]
        );
        setGameContext(newContext);
    };
    
    return (
        <div>
            <h3>Recommended Build</h3>
            {contextualBuild.coreItems.map(item => (
                <ItemIcon key={item.name} item={item} />
            ))}
            
            <div className="tips">
                {contextualBuild.tips.map((tip, i) => (
                    <div key={i} className="tip">{tip}</div>
                ))}
            </div>
        </div>
    );
}
*/

/**
 * ========================================
 * EJECUTAR TODOS LOS EJEMPLOS
 * ========================================
 */
export async function ejecutarTodosLosEjemplos() {
    // Necesitarías cargar los datos reales primero
    const champion = await getChampion('Jinx');  // O cualquier campeón
    const items = await getItems();

    if (!champion) return;

    ejemplo1_BuildBasica(champion, items);
    ejemplo2_BuildContraTanques(champion, items);
    ejemplo3_BuildContraHealing(champion, items);
    ejemplo4_ContextoPersonalizado(champion, items);
    ejemplo5_DebuggingItem(champion, items);
    ejemplo6_ComparacionContextos(champion, items);
}
