import { extensionManager } from "engine/extensions";
import { statsLogger } from "engine/stats_logger"
import { testManager } from './test_manager';
import { Singleton } from "engine/utils/singleton";
import { memoryManager } from "./memory_manager";
import { configs } from "./configs";
import { roleManager } from "./role_manager";
import { spawnManager } from "./spawn_manager";
import { getClassByName } from "./utils/class";
import { hq } from "./headquarters";

class Ai extends Singleton {

    runOnReset(): void {
        statsLogger.logOnReset();
        extensionManager.loadExtensionsOnReset();
        testManager.runOnReset();
        memoryManager.cleanOnReset();
        configs.cleanOnReset();
    }

    runOnTick(): void {
        statsLogger.logOnTickStart();
        extensionManager.loadExtensionsOnTick();

        hq.runOnTick();
        for (const roomName in Game.rooms) {
            roleManager.run(Game.rooms[roomName]);
            spawnManager.run(Game.rooms[roomName]);
        }
        for (const creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            // Act 在 role 前，因为 role 需要 act 初始化后的信息
            creep.runAct();
            creep.runRole();
        }

        testManager.runOnTick();
        statsLogger.logOnTickEnd();
        if(Game.cpu.bucket === 10000) {
            Game.cpu.generatePixel();
        }
    }


    // Singleton Interface
    static getInstance(): Ai {
        return super.getInstance.call(this) as Ai;
    }
}

export const ai = Ai.getInstance();
