import { logger } from "./utils/logger";
import { Singleton } from "./utils/singleton";

export interface HasMemory {
    memory: Object;
}

type ClassName = string;
type MemDest = string;

declare global {
    interface Memory {
        memoryManager: { [dest: MemDest]: ClassName | undefined };
    }
}

class MemoryManager extends Singleton {

    set(obj: HasMemory, dest: MemDest) {
        if (!Memory.memoryManager) {
            Memory.memoryManager = {};
        }
        Memory.memoryManager[dest] = obj.constructor.name;
        eval(`${this.getFullDest(dest)} = obj.memory;`);
    }

    delete(dest: MemDest) {
        eval(`delete ${this.getFullDest(dest)};`);
        delete Memory.memoryManager[dest];
    }

    load<T extends HasMemory>(dest: MemDest): T | undefined {
        const className = Memory.memoryManager[dest];
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
        (<any>global)[cls.name]= cls;
    }

    cleanOnReset() {
        for (const name in Memory.creeps) {
            if (!(name in Game.creeps)) {
                logger.info(`Clean dead creep memory ${name}.`);
                delete Memory.creeps[name];
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
