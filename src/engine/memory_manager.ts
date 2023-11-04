import { registerClass } from "./utils/class";
import { logger } from "./utils/logger";
import { Singleton } from "./utils/singleton";

declare global {
    interface MemoryObj { }
    interface HasMemory {
        memory: MemoryObj;
    }

    type ClassName = string;
    type MemDest = string;
}

declare global {
    interface Memory {
        memoryManager: {
            classMap: { [dest: MemDest]: ClassName },
            reservedCreeps: { [creepName: string]: null }
        };
    }
}

class MemoryManager extends Singleton {
    get memory() {
        return Memory.memoryManager;
    }

    get classMap() {
        return this.memory.classMap;
    }

    get reservedCreeps() {
        return this.memory.reservedCreeps;
    }

    private constructor() {
        super()
        if (!Memory.memoryManager) {
            Memory.memoryManager = {
                classMap: {},
                reservedCreeps: {}
            }
        }
        if (!this.memory.classMap) {
            this.memory.classMap = {};
        }
        if (!this.memory.reservedCreeps) {
            this.memory.reservedCreeps = {};
        }
    }

    set(obj: HasMemory, dest: MemDest) {
        this.classMap[dest] = obj.constructor.name;
        eval(`${this.getFullDest(dest)} = obj.memory;`);
    }

    delete(dest: MemDest) {
        try {
            eval(`delete ${this.getFullDest(dest)};`);
        } catch { }
        delete this.classMap[dest];
    }

    load<T extends HasMemory>(dest: MemDest): T | undefined {
        const className = this.classMap[dest];
        if (!className) {
            return undefined;
        }
        let obj: T;
        try {
            obj = new (<any>global)[className]();
        } catch {
            logger.error(`Class ${className} is not registered.`);
            return undefined;
        }
        obj.memory = this.getObjByDest(dest) as Object;
        return obj as T;
    }

    move(source: MemDest, target: MemDest) {
        const obj = this.load(source);
        this.delete(source);
        if (obj) {
            this.set(obj, target);
        }
    }

    registerClass(cls: new () => HasMemory) {
        registerClass(cls);
    }

    reserveCreep(creepName: string) {
        if (!(creepName in this.reservedCreeps)) {
            this.reservedCreeps[creepName] = null;
        }
    }

    unreserveCreep(creepName: string) {
        delete this.memory.reservedCreeps[creepName];
    }

    cleanOnReset() {
        for (const name in Memory.creeps) {
            if (!(name in Game.creeps) && !(name in this.memory.reservedCreeps)) {
                logger.info(`Clean dead creep memory ${name}.`);
                delete Memory.creeps[name];
            }
        }
        for (const dest in this.classMap) {
            let ret;
            try {
                ret = eval(this.getFullDest(dest));
            } catch {
                this.delete(dest);
            }
            if (ret === undefined) {
                this.delete(dest);
            }
        }
    }

    // Singleton Interface
    static getInstance(): MemoryManager {
        return super.getInstance.call(this) as MemoryManager;
    }

    private getObjByDest(dest: MemDest): Object | undefined {
        return eval(`${this.getFullDest(dest)}`);
    }

    private getFullDest(dest: MemDest): string {
        return `Memory.${dest}`;
    }
}

export const memoryManager = MemoryManager.getInstance();
