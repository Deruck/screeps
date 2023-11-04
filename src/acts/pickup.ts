import { Act } from "engine/act/act";
import { Emoji, Code } from "engine/consts";
import { memoryManager } from "engine/memory_manager";
import { Move } from "./move";
import { Color } from "engine/consts";
import { logger } from "engine/utils/logger";

declare global {
    interface PickupMemory extends ActMemory {
        targetId: Id<Resource>,
    }

    interface PickupOpts extends ActOpts {
        targetId: Id<Resource>,
    }
}
export class Pickup extends Act {
    readonly ACT_NAME: string = "PICKUP";
    readonly ACT_ICON: Emoji = Emoji.PICKUP;
    memory: PickupMemory = {
        //@ts-ignore
        targetId: ""
    }

    constructor(opts?: PickupOpts) {
        super(opts)
        if (!opts) {
            return;
        }
        this.memory.targetId = opts.targetId;
    }

    protected isActValid(subject: Creep): boolean {
        const resource = Game.getObjectById(this.memory.targetId);
        if (!resource || !(resource instanceof Resource)) {
            return false;
        }
        if (!subject.pos.inRangeTo(resource.pos.x, resource.pos.y, 1) && subject.getActiveBodyparts(MOVE) === 0) {
            return false;
        }
        return true;
    }

    protected exec(subject: Creep) {
        const resource = Game.getObjectById(this.memory.targetId);
        if (!resource) {
            return Code.FAILED;
        }
        if (subject.store.getFreeCapacity() <= 0) {
            return Code.FAILED;
        }
        const ret = subject.pickup(resource);
        switch (ret) {
            case OK:
                subject.say(`${this.ACT_ICON}`);
                return Code.DONE;
            case ERR_NOT_IN_RANGE:
                subject.assignAct(
                    new Move({
                        x: resource.pos.x,
                        y: resource.pos.y,
                        range: 1,
                        visualizePathStyle: {
                            stroke: Color.PICKUP
                        }
                    }),
                    true
                );
                return Code.PROCESSING;
            default:
                subject.say(`${this.ACT_ICON}${ret}`);
                return Code.FAILED;
        }
    }
}

memoryManager.registerClass(Pickup);
