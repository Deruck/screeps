import { memoryManager } from "engine/memory_manager";
import { Emoji, Code } from "engine/consts";
import { logger } from "engine/utils/logger";

export type CanActType = Creep | StructureTower;
export type ActId = string;

declare global {

    interface ActMemory {
        id: ActId,
        parentId?: ActId
    }

    interface CanActMemory {
        act?: ActMemory;
        blockedActs?: { [id: ActId]: ActMemory };
        lastActStatus?: Code.DONE | Code.FAILED | Code.PROCESSING;
    }

    interface CreepMemory extends CanActMemory { }

    interface TowerMemory extends CanActMemory { }

    interface ActOpts { }

}

/**
 * 子类需要调用
 * ```typescript
 * memoryManager.registerClass([CLASS_NAME]);
 * ```
 * 注册到缓存管理中
 */
export abstract class Act<T extends CanActType> implements HasMemory {
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
            this.endAct(subject);
            return Code.FAILED;
        }
        if (ret === Code.FAILED) {
            subject.say(Emoji.FAIL);
            this.endAct(subject);
            return Code.FAILED;
        }
        if (ret === Code.DONE) {
            subject.say(Emoji.SUCCESS);
            this.endAct(subject);
            return Code.DONE;
        }
        return Code.PROCESSING;
    }

    assignTo(subject: T, chain: boolean = false): boolean {
        this.memory.id = `${this.ACT_NAME}_${Game.time}_${_.uniqueId()}`;
        if (this.isInitFailed) {
            logger.error(`Act ${this.ACT_NAME} init failed on ${subject.name} with memory ${this.memory}.`);
            return false;
        }
        if (!this.isActValid(subject)) {
            subject.say(`${Emoji.FAIL}: ${this.ACT_ICON}`)
            logger.error(`Act ${this.ACT_NAME} not valid on ${subject.name} with memory ${this.memory}.`);
            return false;
        }
        subject.say(`${this.ACT_ICON}${Emoji.OK}`);
        if (chain && subject.act) {
            if (!subject.memory.blockedActs) {
                subject.memory.blockedActs = {};
            }
            memoryManager.move(
                Act.getActMemoryDest(subject),
                `${Act.getBlockedActsMemoryDest(subject)}["${subject.act.memory.id}"]`
            )
            this.memory.parentId = subject.act.memory.id;
            delete subject.act;
        }
        if (subject.act) {
            (subject.act as Act<T>).endAct(subject, chain);
        }
        (subject.act as Act<T>) = this;
        subject.memory;  // 初始化 memory
        if (subject instanceof Creep) {
            memoryManager.set(subject.act as Act<Creep>, Act.getActMemoryDest(subject));
            this.run(subject);
            return true;
        }
        logger.error(`Act ${this.ACT_NAME} not supported on ${subject.name};`);
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

    public endAct(subject: T, chain: boolean = true) {
        memoryManager.delete(Act.getActMemoryDest(subject));
        if (!this.memory.parentId) {
            return;
        }
        if (!chain) {
            delete subject.memory.blockedActs;
            return;
        }
        if (!subject.memory.blockedActs) {
            logger.error(`Subject ${subject.id} has no blockedActs.`);
            return;
        }
        memoryManager.move(`${Act.getBlockedActsMemoryDest(subject)}["${this.memory.parentId}"]`,
                           Act.getActMemoryDest(subject));
        subject.act = memoryManager.load(Act.getActMemoryDest(subject));
        (subject.act as Act<T>).run(subject);
        subject.say(`${this.ACT_ICON}=>${subject.act?.ACT_ICON}`);
        return;
    }

    static initActOnTick(subject: CanActType): void {
        if (!subject.memory.act) {
            return;
        }
        subject.act = memoryManager.load(Act.getActMemoryDest(subject));
        if (!subject.act) {
            memoryManager.delete(Act.getActMemoryDest(subject));
        }
    }

    private static getActMemoryDest(subject: CanActType): string {
        if (subject instanceof Creep) {
            return `creeps["${subject.name}"].act`;
        }
        throw Error("getActMemoryDest: unsupported type.");
    }

    private static getBlockedActsMemoryDest(subject: CanActType): string {
        if (subject instanceof Creep) {
            return `creeps["${subject.name}"].blockedActs`;
        }
        throw Error("getActMemoryDest: unsupported type.");
    }
}
