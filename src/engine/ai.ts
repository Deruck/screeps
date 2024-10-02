import { extensionManager } from "engine/extensions";
import { statsManager } from "engine/stats_manager"
import { sandBox } from './sandbox';
import { Singleton } from "engine/utils/singleton";
import { memoryManager } from "./memory_manager";

class Ai extends Singleton {

    runOnReset(): void {
        statsManager.logOnReset();
        extensionManager.loadExtensionsOnReset();
        sandBox.runOnReset();
    }

    runOnTick(): void {
        statsManager.logOnTickStart();
        extensionManager.loadExtensionsOnTick();

        sandBox.runOnTick();
        if(Game.cpu.bucket === 10000) {
            Game.cpu.generatePixel();
        }
        statsManager.logOnTickEnd();
    }


    // Singleton Interface
    static getInstance(): Ai {
        return super.getInstance.call(this) as Ai;
    }
}

export const ai = Ai.getInstance();
