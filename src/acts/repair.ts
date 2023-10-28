import { Act } from "engine/act/act";
import { Emoji, ReturnCode } from "engine/consts";
import { memoryManager } from "engine/memory_manager";
import { Move } from "./move";
import { Color } from "engine/consts";

interface RepairMemory extends ActMemory {
    targetId: Id<Structure>
}

interface RepairOpts extends ActOpts {
    targetId: Id<Structure>
}


export class Repair extends Act<Creep> {
    readonly ACT_NAME: string = "REPAIR";
    readonly ACT_ICON: Emoji = Emoji.REPAIR;
    memory: RepairMemory = {
        //@ts-ignore
        targetId: ""
    }

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
    }

    protected isActValid(subject: Creep): boolean {
        const target = Game.getObjectById(this.memory.targetId);
        if (!target) {
            return false;
        }
        if (!subject.pos.inRangeTo(target.pos.x, target.pos.y, 3) && subject.getActiveBodyparts(MOVE) === 0) {
            return false;
        }
        return subject.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
               subject.getActiveBodyparts(WORK) > 0;
    }

    protected exec(subject: Creep) {
        const target = Game.getObjectById(this.memory.targetId);
        if (!target) {
            return ReturnCode.DONE;
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
                return ReturnCode.PROCESSING;
            default:
                subject.say(`${this.ACT_ICON}${ret}`);
                break;
        }
        if (subject.store.getUsedCapacity(RESOURCE_ENERGY) <= 0 ||
            target.hits === target.hitsMax) {
            return ReturnCode.DONE;
        }
        return ReturnCode.PROCESSING;
    }
}

memoryManager.registerClass(Repair);
