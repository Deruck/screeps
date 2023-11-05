import { Role } from "engine/act/role";
import { Color } from "engine/consts";
import { Harvest, Upgrade } from "acts";
import { memoryManager } from "engine/memory_manager";
import { logger } from "engine/utils/logger";

declare global {
    interface PioneerUpgraderOpts extends RoleOpts {
        sourceId: Id<Source>
    }

    interface PioneerUpgraderMemory extends RoleMemory {
        sourceId: Id<Source>;
    }
}

export class PioneerUpgrader extends Role {
    memory: PioneerUpgraderMemory = {
        sourceId: "" as Id<Source>
    }
    readonly NAME: string = "PioneerUpgrader"
    readonly COLOR: Color = Color.UPGRADER;

    /**
     *
     * @param sourceId
     * @returns
     */
    constructor(opts?: PioneerUpgraderOpts) {
        super()
        if (!opts) {
            this.isInitFailed = true;
            return;
        }
        const source = Game.getObjectById(opts.sourceId);
        if (!source || !(source instanceof Source)) {
            this.isInitFailed = true;
            logger.error(`Id ${opts.sourceId} is not a source.`)
            return;
        }
        this.memory.sourceId = opts.sourceId;
    }

    isValid(subject: Creep): boolean {
        return subject.getActiveBodyparts(WORK) > 0 &&
               subject.getActiveBodyparts(CARRY) > 0 &&
               subject.getActiveBodyparts(MOVE) > 0;
    }

    assignAct(subject: Creep): boolean {
        if (!subject.store.getUsedCapacity(RESOURCE_ENERGY)) {
            return subject.assignAct(new Harvest({ targetId: this.memory.sourceId }));
        }
        const controller = subject.room.controller?.id;
        if (controller) {
            return subject.assignAct(new Upgrade({ targetId: controller, times: 4 }));
        }
        return true;
    }
}

memoryManager.registerClass(PioneerUpgrader)
