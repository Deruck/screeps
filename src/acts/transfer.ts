import { Act } from "engine/act/act";
import { Emoji, ReturnCode } from "engine/consts";
import { memoryManager } from "engine/memory_manager";
import { Move } from "./move";
import { Color } from "engine/consts";
import { logger } from "engine/utils/logger";

type Transferable = Creep | PowerCreep | AnyStoreStructure;

interface TransferMemory extends ActMemory {
    targetId: Id<Transferable>,
    resourceType: ResourceConstant,
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
        if (!capacity || capacity <= 0) {
            this.isInitFailed = true;
            console.log(capacity);
            return;
        }
        this.memory.targetId = opts.targetId;
        this.memory.resourceType = opts.resourceType;
        this.memory.amount = opts.amount;
    }

    protected isActValid(subject: Creep): boolean {
        const resourceThr = (this.memory.amount != undefined) ? Math.max(1, this.memory.amount) : 1;
        if (subject.store.getUsedCapacity(this.memory.resourceType) < resourceThr) {
            return false;
        }
        const target = Game.getObjectById(this.memory.targetId);
        if (!target) {
            return false;
        }
        if (!subject.pos.inRangeTo(target.pos.x, target.pos.y, 1) && subject.getActiveBodyparts(MOVE) === 0) {
            return false;
        }
        const store = target.store;
        if (!store) {
            return false;
        }
        const capacity = store.getFreeCapacity(this.memory.resourceType);
        if (!capacity || capacity <= 0) {
            return false;
        }
        return true;
    }

    protected exec(subject: Creep) {
        const target = Game.getObjectById(this.memory.targetId);
        if (!target) {
            return ReturnCode.FAILED;
        }
        const store = target.store;
        if (!store) {
            return ReturnCode.FAILED;
        }
        const capacity = store.getFreeCapacity(this.memory.resourceType);
        if (!capacity) {
            return ReturnCode.FAILED;
        }
        const amount = (this.memory.amount != undefined) ? Math.min(this.memory.amount, capacity) : undefined;
        const ret = subject.transfer(target, this.memory.resourceType, amount);
        switch (ret) {
            case OK:
                subject.say(`${this.ACT_ICON}`);
                return ReturnCode.DONE;
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
                return ReturnCode.PROCESSING;
            default:
                subject.say(`${this.ACT_ICON}${ret}`);
                logger.info(`${this.ACT_ICON}${ret}: resource ${this.memory.resourceType} amount ${amount}`);
                return ReturnCode.FAILED;
        }
    }
}

memoryManager.registerClass(Transfer);
