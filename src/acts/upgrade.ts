import { Act } from "engine/act/act";
import { Emoji, Code } from "engine/consts";
import { memoryManager } from "engine/memory_manager";
import { Move } from "./move";
import { Color } from "engine/consts";

interface UpgradeMemory extends ActMemory {
    targetId: Id<StructureController>
    times?: number
}

interface UpgradeOpts extends ActOpts {
    targetId: Id<StructureController>,
    times?: number
}


export class Upgrade extends Act<Creep> {
    readonly ACT_NAME: string = "UPGRADE";
    readonly ACT_ICON: Emoji = Emoji.UPGRADE;
    memory: UpgradeMemory = {
        //@ts-ignore
        targetId: ""
    }
    /**
     * @param targetId
     */
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
        this.memory.times = opts.times;
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
            return Code.FAILED;
        }
        if (subject.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
            return Code.DONE;
        }
        const ret = subject.upgradeController(target);
        switch (ret) {
            case OK:
                subject.say(`${this.ACT_ICON}`);
                if (this.memory.times != undefined) {
                    this.memory.times--;
                }
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
                return Code.PROCESSING;
            default:
                subject.say(`${this.ACT_ICON}${ret}`);
                return Code.FAILED;
        }
        if (this.memory.times != undefined && this.memory.times <= 0) {
            return Code.DONE;
        }
        return Code.PROCESSING;
    }
}

memoryManager.registerClass(Upgrade);
