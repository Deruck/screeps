import { HasMemory, memoryManager } from "engine/memory_manager";
import { Emoji, Code } from "engine/consts";
import { logger } from "engine/utils/logger";

export type HasActSubject = Creep | StructureTower;
export type ActId = string;

declare global {

    interface ActMemory {
        id: ActId,
        parentId?: ActId
    }

    interface HasActMemory {
        act?: ActMemory;
        blockedActs?: { [id: ActId]: ActMemory };
        lastActStatus?: Code.DONE | Code.FAILED | Code.PROCESSING;
    }

    interface CreepMemory extends HasActMemory { }

    interface TowerMemory extends HasActMemory { }

    interface Memory {
        towers: { [id: string]: TowerMemory };
    }

    interface ActOpts { }

}

/**
 * 子类需要调用
 * ```typescript
 * memoryManager.registerClass([CLASS_NAME]);
 * ```
 * 注册到缓存管理中
 */
export abstract class Act<T extends HasActSubject> implements HasMemory {
    abstract memory: ActMemory;
    abstract readonly ACT_NAME: string;
    abstract readonly ACT_ICON: Emoji;
    protected isInitFailed: boolean = false;

    constructor(opts?: ActOpts) {
        if (!opts) {
            return;
        }
    }

    run(subject: T): Code.PROCESSING |
                     Code.DONE |
                     Code.FAILED {
        let ret;
        try {
            ret = this.exec(subject);
        } catch(err) {
            logger.error(`Error occurs on act ${this.ACT_NAME}.exec with message "${err}"`);
            subject.say(Emoji.FAIL);
            this.finishAct(subject);
            return Code.FAILED;
        }
        if (ret == Code.FAILED) {
            subject.say(Emoji.FAIL);
            this.finishAct(subject);
            return Code.FAILED;
        }
        if (ret == Code.DONE) {
            subject.say(Emoji.SUCCESS);
            this.finishAct(subject);
            return Code.DONE;
        }
        return Code.PROCESSING;
    }

    assignTo(subject: T, chain: boolean = false): boolean {
        this.memory.id = `${this.ACT_NAME}_${Game.time}_${_.uniqueId()}`;
        if (this.isInitFailed) {
            logger.error(`Init failed for act ${this.ACT_NAME}.`);
            return false;
        }
        if (!this.isActValid(subject)) {
            subject.say(`${Emoji.FAIL}: ${this.ACT_ICON}`)
            logger.warn(`Not valid for act ${this.ACT_NAME}.`);
            return false;
        }
        subject.say(`${this.ACT_ICON}${Emoji.OK}`);
        if (chain && subject.act) {
            if (!subject.memory.blockedActs) {
                subject.memory.blockedActs = {};
            }
            memoryManager.move(
                this.getActMemoryDest(subject),
                `${this.getBlockedActsMemoryDest(subject)}["${subject.act.memory.id}"]`
            )
            this.memory.parentId = subject.act.memory.id;
            delete subject.act;
        }
        if (!chain) {
            delete subject.memory.blockedActs;
        }
        (subject.act as Act<T>) = this;
        if (subject instanceof Creep) {
            if (!Memory.creeps[subject.name]) {
                Memory.creeps[subject.name] = {};
            }
            memoryManager.set(subject.act as Act<Creep>, this.getActMemoryDest(subject));
            return true;
        }
        logger.error(`Act ${this.ACT_NAME} init failed on ${subject.id};`);
        return false;
    }

    /**
     * 检查行动是否满足合法条件
     */
    protected abstract isActValid(subject: T): boolean;
    /**
     * 执行
     * 返回值：
     * PROCESSING: 执行中
     * DONE: 执行结束
     * FAILED: 执行中途失败
     */
    protected abstract exec(subject: T):
        Code.PROCESSING |
        Code.DONE |
        Code.FAILED;

    public finishAct(subject: T) {
        memoryManager.delete(this.getActMemoryDest(subject));
        if (!this.memory.parentId) {
            return;
        }
        if (!subject.memory.blockedActs) {
            logger.error(`Subject ${subject.id} has no blockedActs.`);
            return;
        }
        memoryManager.move(`${this.getBlockedActsMemoryDest(subject)}["${this.memory.parentId}"]`,
                           this.getActMemoryDest(subject));
        subject.act = memoryManager.load(this.getActMemoryDest(subject));
        subject.say(`${this.ACT_ICON}=>${subject.act?.ACT_ICON}`);
        return;
    }

    private getActMemoryDest(subject: T): string {
        if (subject instanceof Creep) {
            return `creeps["${subject.name}"].act`;
        }
        throw Error("getActMemoryDest: unsupported type.");
    }

    private getBlockedActsMemoryDest(subject: T): string {
        if (subject instanceof Creep) {
            return `creeps["${subject.name}"].blockedActs`;
        }
        throw Error("getActMemoryDest: unsupported type.");
    }
}


export function runActs() {
    for (const creepName in Game.creeps) {
        Game.creeps[creepName].run();
    }
}
