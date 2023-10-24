import { Singleton } from "utils/singleton";
import { Durable } from "utils/durable";

class DurableClass extends Durable {
    set: number[] = []
}

export class TestManager extends Singleton {
    runOnReset() {
        let durableObj = new DurableClass();
        durableObj.initialize("durableObj");
        durableObj.set.push(1);
        durableObj.set.push(2);
        durableObj.initialize("durableObj");
    }

    runOnTick() {
        let durableObj = new DurableClass().initialize("durableObj");
        console.log(durableObj.set);
    }

    static getInstance(): TestManager {
        return super.getInstance.call(this) as TestManager;
    }
}
