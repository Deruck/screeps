import { Singleton } from "engine/utils/singleton";

class TestManager extends Singleton {
    runOnReset() {

    }

    runOnTick() {

    }

    static getInstance(): TestManager {
        return super.getInstance.call(this) as TestManager;
    }
}

export const testManager = TestManager.getInstance();
