import { extensionManager } from "engine/extension_manager";
import { statsLogger } from "engine/stats_logger"
import { testManager } from './test_manager';
import { Singleton } from "engine/utils/singleton";
import { runActs } from "./act/act";
import { Move } from "acts/move";
import { Harvest } from "acts/harvest";
import { memoryManager } from "./memory_manager";
import { Build } from "acts/build";
import { Upgrade } from "acts/upgrade";
import { Transfer } from "acts/transfer";
import { Repair } from "acts/repair";
import { Withdraw } from "acts/withdraw";
import { Pickup } from "acts/pickup";


new Move();
new Harvest();
new Build();
new Upgrade();
new Transfer();
new Repair();
new Withdraw();
new Pickup();

class Ai extends Singleton {

    runOnReset(): void {
        statsLogger.logOnReset();
        extensionManager.loadExtensionsOnReset();
        testManager.runOnReset();
        memoryManager.cleanOnReset();
    }

    runOnTick(): void {
        statsLogger.logOnTickStart();
        extensionManager.loadExtensionsOnTick();
        runActs();
        testManager.runOnTick();
        statsLogger.logOnTickEnd();
    }


    // Singleton Interface
    static getInstance(): Ai {
        return super.getInstance.call(this) as Ai;
    }
}

export const ai = Ai.getInstance();
