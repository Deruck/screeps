import { Act } from "engine/act/act";
import { Emoji, Code } from "engine/consts";
import { memoryManager } from "engine/memory_manager";
import { Move } from "./move";
import { Color } from "engine/consts";

interface RepairMemory extends ActMemory {
    targetId: Id<Structure>,
    thres?: number
}

interface RepairOpts extends ActOpts {
    targetId: Id<Structure>,
    thres?: number
}


export class Repair extends Act<Creep> {
    readonly ACT_NAME: string = "REPAIR";
    readonly ACT_ICON: Emoji = Emoji.REPAIR;
    memory: RepairMemory = {
        //@ts-ignore
        targetId: ""
    }

    /**
     * @param {[Id<Structure>]} targetId
     * @param {?number} thres thres > 1 时为绝对hits，0 < thres <= 1 时为与最大hits的比例
     */
    constructor(opts?: RepairOpts) {
        super(opts)
        if (!opts) {
            return;
        }
        if (!(Game.getObjectById(opts.targetId) instanceof Structure)) {
            this.isInitFailed = true;
            return;
        }
        this.memory.targetId = opts.targetId;
        this.memory.thres = opts.thres;
    }

    protected isActValid(subject: Creep): boolean {
        const target = Game.getObjectById(this.memory.targetId);
        if (!target) {
            return false;
        }
        if (!subject.pos.inRangeTo(target.pos.x, target.pos.y, 3) && subject.getActiveBodyparts(MOVE) === 0) {
            return false;
        }
        return subject.getActiveBodyparts(WORK) > 0;
    }

    protected exec(subject: Creep) {
        const target = Game.getObjectById(this.memory.targetId);
        if (!target) {
            return Code.DONE;
        }
        let thres = this.memory.thres != undefined ? this.memory.thres : target.hitsMax;
        if (thres <= 1) {
            thres *= target.hitsMax;
        }
        if (subject.store.getUsedCapacity(RESOURCE_ENERGY) <= 0 ||
            target.hits >= thres) {
            return Code.DONE;
        }
        const ret = subject.repair(target);
        switch (ret) {
            case OK:
                subject.say(`${this.ACT_ICON}`);
                break;
            case ERR_NOT_IN_RANGE:
                subject.assignAct(
                    new Move({
                        x: target.pos.x,
                        y: target.pos.y,
                        range: 3,
                        visualizePathStyle: {
                            stroke: Color.REPAIR
                        }
                    }),
                    true
                );
                return Code.PROCESSING;
            default:
                subject.say(`${this.ACT_ICON}${ret}`);
                break;
        }
        return Code.PROCESSING;
    }
}

memoryManager.registerClass(Repair);
