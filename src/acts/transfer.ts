import { Act } from "engine/act/act";
import { Emoji, Code } from "engine/consts";
import { memoryManager } from "engine/memory_manager";
import { Move } from "./move";
import { Color } from "engine/consts";
import { logger } from "engine/utils/logger";

type Transferable = Creep | PowerCreep | AnyStoreStructure;

interface TransferMemory extends ActMemory {
    targetId: Id<Transferable>,
    resourceType: ResourceConstant,
    resourceThr: number,
    amount?: number
}

interface TransferOpts extends ActOpts {
    targetId: Id<Transferable>,
    resourceType: ResourceConstant,
    amount?: number
}


export class Transfer extends Act<Creep> {
    readonly ACT_NAME: string = "TRANSFER";
    readonly ACT_ICON: Emoji = Emoji.TRANSFER;
    memory: TransferMemory = {
        //@ts-ignore
        targetId: ""
    }

    /**
     * @param targetId: Id<Transferable>
     * @param resourceType: ResourceConstant
     * @param amount?: number
     */
    constructor(opts?: TransferOpts) {
        super(opts)
        if (!opts) {
            return;
        }
        const store = Game.getObjectById(opts.targetId)?.store;
        if (!store) {
            this.isInitFailed = true;
            return;
        }
        const capacity = store.getFreeCapacity(opts.resourceType);
        if (capacity == undefined) {
            this.isInitFailed = true;
            return;
        }
        this.memory.targetId = opts.targetId;
        this.memory.resourceType = opts.resourceType;
        this.memory.amount = opts.amount;
        this.memory.resourceThr = (opts.amount != undefined) ? opts.amount : 1;
    }

    protected isActValid(subject: Creep): boolean {
        const target = Game.getObjectById(this.memory.targetId);
        if (!target) {
            return false;
        }
        const store = target.store;
        if (!store) {
            return false;
        }
        if (!subject.pos.inRangeTo(target.pos.x, target.pos.y, 1) && subject.getActiveBodyparts(MOVE) === 0) {
            return false;
        }
        return subject.getActiveBodyparts(CARRY) > 0;
    }

    protected exec(subject: Creep) {
        const target = Game.getObjectById(this.memory.targetId);
        if (!target) {
            return Code.FAILED;
        }
        const store = target.store;
        if (!store) {
            return Code.FAILED;
        }
        const targetCapacity = store.getFreeCapacity(this.memory.resourceType);
        if (targetCapacity == null || targetCapacity < this.memory.resourceThr) {
            return Code.FAILED;
        }
        const subjectCapacity = subject.store.getUsedCapacity(this.memory.resourceType);
        if (subjectCapacity == null || subjectCapacity < this.memory.resourceThr) {
            return Code.FAILED;
        }
        const ret = subject.transfer(target, this.memory.resourceType, this.memory.amount);
        switch (ret) {
            case OK:
                subject.say(`${this.ACT_ICON}`);
                return Code.DONE;
            case ERR_NOT_IN_RANGE:
                subject.assignAct(
                    new Move({
                        x: target.pos.x,
                        y: target.pos.y,
                        range: 1,
                        visualizePathStyle: {
                            stroke: Color.TRANSFER
                        }
                    }),
                    true
                );
                return Code.PROCESSING;
            default:
                subject.say(`${this.ACT_ICON}${ret}`);
                logger.info(`${this.ACT_ICON}${ret}: resource ${this.memory.resourceType} amount ${this.memory.amount}`);
                return Code.FAILED;
        }
    }
}

memoryManager.registerClass(Transfer);
