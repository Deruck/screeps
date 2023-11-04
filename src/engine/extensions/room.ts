import { logger } from "engine/utils/logger";

declare global {
    interface Room {
        findResources(resourceType: RESOURCE_ENERGY | MineralConstant): Id<Source | Mineral>[];
        findWeakestReinforceable(
            thres: number, structureType?: STRUCTURE_WALL | STRUCTURE_RAMPART
        ): Id<StructureWall | StructureRampart> | null;
        findSoonestDecayRuin(resourceType?: ResourceConstant): Id<Ruin | Tombstone> | null;
        findMySpawns(onlyIdle?: boolean): StructureSpawn[];
    }

    interface RoomMemory {
        resources: Partial<Record<ResourceConstant, Id<Source | Mineral>[]>>
    }
}

function findResources(this: Room, resourceType: RESOURCE_ENERGY | MineralConstant) {
    if (!this.memory.resources) {
        this.memory.resources = {};
    }
    if (!this.memory.resources[resourceType]) {
        if (resourceType === RESOURCE_ENERGY) {
            this.memory.resources[resourceType] =
                this.find(FIND_SOURCES)
                    .map((value, index, array)=> value.id);
        } else {
            this.memory.resources[resourceType] = []
            logger.error(`Resource const ${resourceType} is not supported.`)
        }
    }
    return this.memory.resources[resourceType] as Id<Source | Mineral>[];
}

function findWeakestReinforceable(
    this: Room, thres: number, structureType?: STRUCTURE_WALL | STRUCTURE_RAMPART
): Id<StructureWall | StructureRampart> | null {
    const getThres = function (structure: Structure): number {
        return thres <= 1 ? thres * structure.hitsMax : thres;
    }
    const ramparts: StructureRampart[] = this.find(
        FIND_MY_STRUCTURES,
        {
            filter: (structure: OwnedStructure) =>
                       structure.structureType === STRUCTURE_RAMPART &&
                       structure.hits < getThres(structure)
        }
    )
    const walls: StructureWall[] = this.find(
        FIND_STRUCTURES,
        {
            filter: (structure: Structure) =>
                       structure.structureType === STRUCTURE_WALL &&
                       structure.hits < getThres(structure)
        }
    )
    const targets = [...ramparts, ...walls];
    if (!targets.length) {
        return null;
    }
    return _.min(targets, (s) => s.hits).id;
}

function findSoonestDecayRuin(this: Room, resourceType?: ResourceConstant): Id<Ruin | Tombstone> | null {
    let ruins: Ruin[] = [];
    let tombstones: Tombstone[] = [];
    if (resourceType != undefined) {
        ruins = this.find(
            FIND_RUINS,
            {
                filter: function (ruin: Ruin) {
                    const capacity = ruin.store.getUsedCapacity(resourceType);
                    return capacity != null && capacity > 0;
                }
            }
        )
        tombstones = this.find(
            FIND_TOMBSTONES,
            {
                filter: function (tombstone: Ruin) {
                    const capacity = tombstone.store.getUsedCapacity(resourceType);
                    return capacity != null && capacity > 0;
                }
            }
        )
    } else {
        ruins = this.find(FIND_RUINS);
        tombstones = this.find(FIND_TOMBSTONES);
    }
    const targets = [...ruins, ...tombstones];
    if (!targets.length) {
        return null;
    }
    return _.min(targets, (s) => s.ticksToDecay).id;
}

function findMySpawns(this: Room, onlyIdle: boolean = false): StructureSpawn[] {
    if (onlyIdle) {
        return this.find(
            FIND_MY_SPAWNS,
            { filter: (s: StructureSpawn) => s.spawning == null }
        );
    } else {
        return this.find(FIND_MY_SPAWNS);
    }
}

export function loadRoomExtension() {
    Room.prototype.findResources = findResources;
    Room.prototype.findWeakestReinforceable = findWeakestReinforceable;
    Room.prototype.findSoonestDecayRuin = findSoonestDecayRuin;
    Room.prototype.findMySpawns = findMySpawns;
}
