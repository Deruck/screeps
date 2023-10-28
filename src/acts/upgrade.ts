import { Act } from "engine/act/act";
import { Emoji, ReturnCode } from "engine/consts";
import { memoryManager } from "engine/memory_manager";
import { Move } from "./move";
import { Color } from "engine/consts";

interface UpgradeMemory extends ActMemory {
    targetId: Id<StructureController>
}

interface UpgradeOpts extends ActOpts {
    targetId: Id<StructureController>
}


export class Upgrade extends Act<Creep> {
    readonly ACT_NAME: string = "UPGRADE";
    readonly ACT_ICON: Emoji = Emoji.UPGRADE;
    memory: UpgradeMemory = {
        //@ts-ignore
        targetId: ""
    }

    constructor(opts?: UpgradeOpts) {
        super(opts)
        if (!opts) {
            return;
        }
        if (!(Game.getObjectById(opts.targetId) instanceof StructureController)) {
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
            return ReturnCode.FAILED;
        }
        const ret = subject.upgradeController(target);
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
                            stroke: Color.UPGRADE
                        }
                    }),
                    true
                );
                return ReturnCode.PROCESSING;
            default:
                subject.say(`${this.ACT_ICON}${ret}`);
                return ReturnCode.FAILED;
        }
        if (subject.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
            return ReturnCode.DONE;
        }
        return ReturnCode.PROCESSING;
    }
}

memoryManager.registerClass(Upgrade);
