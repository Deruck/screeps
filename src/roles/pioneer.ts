import { Role } from "engine/act/role";
import { Color } from "engine/consts";
import { Pickup, Build, Harvest, Transfer, Withdraw, Repair, Upgrade } from "acts";
import { memoryManager } from "engine/memory_manager";


interface PioneerMemory extends RoleMemory {
    sourceId: Id<Source>;
    repairTargetId?: Id<Structure>;
    repairThres?: number;
}

export class Pioneer extends Role<Creep> {
    memory: PioneerMemory = {
        sourceId: "" as Id<Source>
    }
    readonly NAME: string = "Pioneer"
    readonly COLOR: Color = Color.PIONEER;

    /**
     *
     * @param sourceId
     * @returns
     */
    constructor(opts?: {
        sourceId: Id<Source>
    }) {
        super()
        if (!opts) {
            this.isInitFailed = true;
            return;
        }
        const source = Game.getObjectById(opts.sourceId);
        if (!source || !(source instanceof Source)) {
            this.isInitFailed = true;
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
        const pickable = subject.pos.findNearestPickable({ type: "path" }, RESOURCE_ENERGY);
        if (pickable && subject.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            return subject.assignAct(new Pickup({ targetId: pickable }));
        }
        const ruin = subject.room.findSoonestDecayRuin(RESOURCE_ENERGY);
        if (ruin && subject.store.getFreeCapacity(RESOURCE_ENERGY) > subject.store.getCapacity() / 2) {
            return subject.assignAct(new Withdraw({ targetId: ruin, resourceType: RESOURCE_ENERGY }));
        }
        if (!subject.store.getUsedCapacity(RESOURCE_ENERGY)) {
            return subject.assignAct(new Harvest({ targetId: this.memory.sourceId }));
        }
        const rechargeable = subject.pos.findNearestRechargeable({ type: "path" });
        if (rechargeable) {
            return subject.assignAct(new Transfer(
                { targetId: rechargeable, resourceType: RESOURCE_ENERGY }));
        }
        // 继续维修任务
        if (this.memory.repairTargetId != undefined && this.memory.repairThres != undefined) {
            const target = Game.getObjectById(this.memory.repairTargetId);
            if (!target) {
                delete this.memory.repairTargetId;
                delete this.memory.repairThres;
            } else {
                const thres = this.memory.repairThres <= 1 ? this.memory.repairThres * target.hitsMax : this.memory.repairThres;
                if (target.hitsMax >= thres) {
                    delete this.memory.repairTargetId;
                    delete this.memory.repairThres;
                } else {
                    return subject.assignAct(new Repair({ targetId: this.memory.repairTargetId, thres: this.memory.repairThres}));
                }
            }
        }
        const repairable = subject.pos.findNearestRepairable({ type: "path" }, 0.8);
        if (repairable) {
            this.memory.repairTargetId = repairable;
            this.memory.repairThres = 1;
            return subject.assignAct(new Repair({ targetId: repairable }));
        }
        const buildable = subject.pos.findNearestBuildable({ type: "path" });
        if (buildable) {
            return subject.assignAct(new Build({ targetId: buildable }));
        }
        const reinforceable = subject.room.findWeakestReinforceable(500000);
        if (reinforceable) {
            this.memory.repairTargetId = reinforceable;
            this.memory.repairThres = 1000000;
            return subject.assignAct(new Repair({ targetId: reinforceable, thres: 1000000 }));
        }
        const controller = subject.room.controller?.id;
        if (controller) {
            return subject.assignAct(new Upgrade({ targetId: controller, times: 4 }));
        }
        return true;
    }
}

memoryManager.registerClass(Pioneer)
