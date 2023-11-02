import { Singleton } from "./utils/singleton";

class Runner extends Singleton {

    runOnReset() { }

    runOnTick() {
        for (const creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            // Act 在 role 前，因为 role 需要 act 初始化后的信息
            creep.runAct();
            creep.runRole();
        }
        for (const spawnName in Game.spawns) {
            Game.spawns[spawnName].run();
        }
    }


    // Singleton Interface
    static getInstance(): Runner {
        return super.getInstance.call(this) as Runner;
    }
}

export const runner = Runner.getInstance();
