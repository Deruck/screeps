import { ExtensionManager } from "modules/extension_manager";
import { StatsLogger } from "modules/stats_logger"
import { TestManager } from './test_manager/test_manager';
import { Singleton } from "utils/singleton";

export class Ai extends Singleton {

    runOnReset(): void {
        StatsLogger.logOnReset();
        ExtensionManager.loadExtensionsOnReset();
        TestManager.getInstance().runOnReset();
    }

    runOnTick(): void {
        StatsLogger.logOnTickStart();
        ExtensionManager.loadExtensionsOnTick();
        TestManager.getInstance().runOnTick();
        Memory.clean();
        StatsLogger.logOnTickEnd();
    }


    static getInstance(): Ai {
        return super.getInstance.call(this) as Ai;
    }
}
