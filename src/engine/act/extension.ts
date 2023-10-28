import { logger } from "engine/utils/logger";
import { HasActSubject, Act } from "./act";
import { memoryManager } from "engine/memory_manager";
import { Code } from "engine/consts";

declare global {

    interface Constructor<T extends _HasId> extends _Constructor<T>, _ConstructorById<T> {}

    interface HasAct<T extends HasActSubject> {
        run(this: T):
            Code.DONE |
            Code.FAILED |
            Code.PROCESSING |
            Code.IDLE;
        assignAct(this: T, act: Act<T>, chain: boolean): boolean;
        getActName(this: T): string | undefined;
        isIdle(this: T): boolean;
        act?: Act<T>;
    }

    interface Creep extends HasAct<Creep> { }

    interface StructureTower extends HasAct<StructureTower> {
        say(message: string, toPublic?: boolean): OK | ERR_NOT_OWNER | ERR_BUSY;
        get memory(): TowerMemory;
        get name(): string;
    }
}

function run(this: HasActSubject) {
    if (this instanceof Creep && this.memory.act) {
        this.act = memoryManager.load(`creeps["${this.name}"].act`);
        if (!this.act) {
            memoryManager.delete(`creeps["${this.name}"].act`);
        }
    } else {
        return Code.FAILED;
    }
    if (this.act) {
        const ret = (this.act as Act<typeof this>).run(this);
        this.memory.lastActStatus = ret;
        return ret;
    }
    return Code.IDLE;
}

function assignAct<T extends HasActSubject>(this: T, act: Act<T>, chain: boolean = false) {
    return act.assignTo(this, chain);
}

function getActName(this: HasActSubject) {
    if (this.act) {
        return this.act.ACT_NAME;
    }
    return undefined;
}

export function loadActExtension() {
    const loadClass = function <T extends HasActSubject> (cls: Constructor<T>) {
        cls.prototype.run = run;
        // @ts-ignore
        cls.prototype.assignAct = assignAct<T>;
        cls.prototype.getActName = getActName;
    }
    loadClass<Creep>(Creep);
    loadClass<StructureTower>(StructureTower);
}
