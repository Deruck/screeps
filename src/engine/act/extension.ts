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
        /**按先后顺序设置行动链 */
        assignActChain(this: T, actChain: Act<T>[], chian: boolean): boolean;
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

function assignActChain<T extends HasActSubject>(this: T, actChain: Act<T>[], chain: boolean = false) {
    const revertActId = this.act?.memory.id;
    const revertAct = function (subject: T) {
        if (chain && revertActId != undefined) {
            while (subject.act && subject.act.memory.id != revertActId) {
                //@ts-ignore
                this.act.finishAct(this);
            }
        }
    }
    //@ts-ignore
    if (!this.assignAct(actChain[actChain.length - 1], chain)) {
        revertAct(this);
        return false;
    }
    for (let i = actChain.length - 2; i >= 0; i--) {
        //@ts-ignore
        if (!this.assignAct(actChain[i], true)) {
            revertAct(this);
            return false;
        }
    }
    return true;
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
        // @ts-ignore
        cls.prototype.assignActChain = assignActChain<T>;
        cls.prototype.getActName = getActName;
    }
    loadClass<Creep>(Creep);
    loadClass<StructureTower>(StructureTower);
}
