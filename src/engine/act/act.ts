import { memoryManager } from "engine/memory_manager";
import { Emoji, Code } from "engine/consts";
import { logger } from "engine/utils/logger";

export type ActId = string;

declare global {

    interface ActMemory {
        id: ActId,
        parentId?: ActId
    }

    interface CreepMemory {
        act?: ActMemory;
        blockedActs?: { [id: ActId]: ActMemory };
        lastActStatus?: Code.DONE | Code.FAILED | Code.PROCESSING;
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
export abstract class Act implements HasMemory {
    abstract memory: ActMemory;
    abstract readonly ACT_NAME: string;
    abstract readonly ACT_ICON: Emoji;
    protected isInitFailed: boolean = false;

    constructor(opts?: ActOpts) {
        if (!opts) {
            return;
        }
    }

    run(subject: Creep): Code.PROCESSING |
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

    assignTo(subject: Creep, chain: boolean = false): boolean {
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
            (subject.act as Act).endAct(subject, chain);
        }
        subject.act = this;
        subject.memory;  // 初始化 memory
        memoryManager.set(subject.act as Act, Act.getActMemoryDest(subject));
        this.run(subject);
        return true;
    }

    /**
     * 检查行动是否满足合法条件
     */
    protected abstract isActValid(subject: Creep): boolean;
    /**
     * 执行
     * 返回值：
     * PROCESSING: 执行中
     * DONE: 执行结束
     * FAILED: 执行中途失败
     */
    protected abstract exec(subject: Creep):
        Code.PROCESSING |
        Code.DONE |
        Code.FAILED;

    public endAct(subject: Creep, chain: boolean = true) {
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
        (subject.act as Act).run(subject);
        subject.say(`${this.ACT_ICON}=>${subject.act?.ACT_ICON}`);
        return;
    }

    static initActOnTick(subject: Creep): void {
        if (!subject.memory.act) {
            return;
        }
        subject.act = memoryManager.load(Act.getActMemoryDest(subject));
        if (!subject.act) {
            memoryManager.delete(Act.getActMemoryDest(subject));
        }
    }

    private static getActMemoryDest(subject: Creep): string {
        return `creeps["${subject.name}"].act`;
    }

    private static getBlockedActsMemoryDest(subject: Creep): string {
        return `creeps["${subject.name}"].blockedActs`;
    }
}
