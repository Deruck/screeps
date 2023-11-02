import { extensionManager } from "engine/extensions";
import { statsLogger } from "engine/stats_logger"
import { testManager } from './test_manager';
import { Singleton } from "engine/utils/singleton";
import { memoryManager } from "./memory_manager";
import { runner } from "./runner";

class Ai extends Singleton {

    runOnReset(): void {
        statsLogger.logOnReset();
        extensionManager.loadExtensionsOnReset();
        runner.runOnReset();
        testManager.runOnReset();
        memoryManager.cleanOnReset();
    }

    runOnTick(): void {
        statsLogger.logOnTickStart();
        extensionManager.loadExtensionsOnTick();
        runner.runOnTick();
        testManager.runOnTick();
        statsLogger.logOnTickEnd();
    }


    // Singleton Interface
    static getInstance(): Ai {
        return super.getInstance.call(this) as Ai;
    }
}

export const ai = Ai.getInstance();
