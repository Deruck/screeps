import { Act } from "engine/act/act";
import { Emoji, Code } from "engine/consts";
import { memoryManager } from "engine/memory_manager";
import { Move } from "./move";
import { Color } from "engine/consts";
import { logger } from "engine/utils/logger";

type Withdrawable = Tombstone | Ruin | AnyStoreStructure;

interface WithdrawMemory extends ActMemory {
    targetId: Id<Withdrawable>,
    resourceType: ResourceConstant,
    capacityTrhes: number,
    targetUsedCapacityThres: number,
    amount?: number,
}

interface WithdrawOpts extends ActOpts {
    targetId: Id<Withdrawable>,
    resourceType: ResourceConstant,
    amount?: number
}


export class Withdraw extends Act<Creep> {
    readonly ACT_NAME: string = "WITHDRAW";
    readonly ACT_ICON: Emoji = Emoji.WITHDRAW;
    memory: WithdrawMemory = {
        //@ts-ignore
        targetId: ""
    }

    constructor(opts?: WithdrawOpts) {
        super(opts)
        if (!opts) {
            return;
        }
        const store = Game.getObjectById(opts.targetId)?.store;
        if (!store) {
            this.isInitFailed = true;
            return;
        }
        const capacity = store.getUsedCapacity(opts.resourceType);
        if (!capacity || capacity <= 0) {
            this.isInitFailed = true;
            console.log(capacity);
            return;
        }
        this.memory.targetId = opts.targetId;
        this.memory.resourceType = opts.resourceType;
        this.memory.amount = opts.amount;
        this.memory.capacityTrhes = (this.memory.amount != undefined) ? this.memory.amount : 1;
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

    private isSubjectCapacityValid(store: StoreDefinition) {
        const capacity = store.getFreeCapacity(this.memory.resourceType);
        return capacity != null && capacity >= this.memory.capacityTrhes;
    }

    private isTargetCapacityValid(store: StoreDefinition) {
        const capacity = store.getUsedCapacity(this.memory.resourceType);
        return capacity != null && capacity >= this.memory.capacityTrhes;
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
        if (!this.isSubjectCapacityValid(subject.store) ||
            !this.isTargetCapacityValid(store)) {
            return Code.FAILED;
        }
        const ret = subject.withdraw(target, this.memory.resourceType, this.memory.amount);
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
                            stroke: Color.WITHDRAW
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

memoryManager.registerClass(Withdraw);
