declare global {

    interface FindOpts {
        type: "range" | "path",
        algorithm?: "astar" | "dijkstra"
    }

    type Rechargeable = StructureSpawn | StructureExtension;
    type Repairable = Exclude<Structure, StructureWall | StructureRampart>;

    interface RoomPosition {
        findNearestRechargeable(opts: FindOpts): Id<Rechargeable> | null;
        findNearestPickable(opts: FindOpts, resourceType?: ResourceConstant): Id<Resource> | null;
        // TODO 依靠Flag设置优先级机制
        findNearestBuildable(opts: FindOpts, structureType?: StructureConstant): Id<ConstructionSite> | null;
        findNearestRepairable(opts: FindOpts, thres: number, structureType?: StructureConstant): Id<Repairable> | null;
        /**找到最近的生命值不高于thres的墙或城墙
         * thres > 1 时为绝对hits，0 < thres <= 1 时为与最大hits的比例
         */
        findNearestReinforceable(
            opts: FindOpts, thres: number,  structureType?: STRUCTURE_WALL | STRUCTURE_RAMPART
        ): Id<StructureWall | StructureRampart> | null;
    }
}

type FindConstWithoutId =
    FIND_EXIT_TOP |
    FIND_EXIT_RIGHT |
    FIND_EXIT_BOTTOM |
    FIND_EXIT_LEFT |
    FIND_EXIT |
    FIND_FLAGS;

type Filter<K extends Exclude<FindConstant, FindConstWithoutId>, S extends Exclude<FindTypes[K], RoomPosition | Flag>> =
    FilterFunction<FindTypes[K], S> | FilterObject | string;

function getResId<K extends Exclude<FindConstant, FindConstWithoutId>, S extends Exclude<FindTypes[K], RoomPosition | Flag>>(
    pos: RoomPosition, findType: K, opts: FindOpts, filter?: Filter<K, S>
): Id<S> | null {
    let res;
    if (opts.type == "path") {
        res = pos.findClosestByPath(
            findType,
            { filter: filter, algorithm: opts.algorithm }
        )
    } else {
        if (filter) {
            res = pos.findClosestByRange(
                findType,
                { filter: filter }
            );
        } else {
            res = pos.findClosestByRange(findType);
        }

    }
    return res?.id as Id<S> | null;
}

function findNearestRechargeable(this: RoomPosition, opts: FindOpts): Id<Rechargeable> | null {
    const findType = FIND_MY_STRUCTURES;
    const filter = function (structure: AnyStoreStructure & AnyOwnedStructure) {
        return (structure.structureType === STRUCTURE_SPAWN ||
                structure.structureType === STRUCTURE_EXTENSION) &&
               structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    }
    return getResId(this, findType, opts, filter);
}

function findNearestPickable(this: RoomPosition, opts: FindOpts, resourceType?: ResourceConstant): Id<Resource> | null {
    const findType = FIND_DROPPED_RESOURCES;
    let filter = undefined;
    if (resourceType != undefined) {
        filter = function (resource: Resource) {
            return resource.resourceType === resourceType;
        }
    }
    return getResId(this, findType, opts, filter);
}

function findNearestBuildable(this: RoomPosition, opts: FindOpts, structureType?: StructureConstant): Id<ConstructionSite> | null {
    const findType = FIND_MY_CONSTRUCTION_SITES;
    let filter = undefined;
    if (structureType != undefined) {
        filter = { structureType: structureType };
    }
    return getResId(this, findType, opts, filter);
}

function findNearestRepairable(this: RoomPosition, opts: FindOpts, thres: number, structureType?: StructureConstant): Id<Repairable> | null {
    const findType = FIND_MY_STRUCTURES;
    let filter;
    if (structureType != undefined) {
        filter = function (structure: OwnedStructure) {
            if (structure.structureType === STRUCTURE_RAMPART) {
                return false;
            }
            const thres_ = thres <= 1 ? thres * structure.hitsMax : thres;
            return structure.hits < thres_;
        }
    } else {
        filter = function (structure: OwnedStructure) {
            if (structure.structureType !== structureType) {
                return false;
            }
            const thres_ = thres <= 1 ? thres * structure.hitsMax : thres;
            return structure.hits < thres_;
        }
    }
    return getResId(this, findType, opts, filter);
}

function findNearestReinforceable(
    this: RoomPosition, opts: FindOpts, thres: number, structureType?: STRUCTURE_WALL | STRUCTURE_RAMPART
): Id<StructureWall | StructureRampart> | null {
    const findType = FIND_STRUCTURES;
    let filter;
    if (structureType == undefined) {
        filter = function (structure: Structure) {
            if (structure.structureType !== STRUCTURE_WALL &&
                structure.structureType !== STRUCTURE_RAMPART) {
                return false;
            }
            if (structure.structureType === STRUCTURE_RAMPART &&
                !(structure as OwnedStructure).my) {
                return false;
            }
            const thres_ = thres <= 1 ? thres * structure.hitsMax : thres;
            return structure.hits < thres_;
        }
    } else if (structureType === STRUCTURE_WALL) {
        filter = function (structure: Structure) {
            if (structure.structureType !== STRUCTURE_WALL) {
                return false;
            }
            const thres_ = thres <= 1 ? thres * structure.hitsMax : thres;
            return structure.hits < thres_;
        }
    } else if (structureType === STRUCTURE_RAMPART) {
        filter = function (structure: OwnedStructure) {
            if (structure.structureType !== STRUCTURE_RAMPART) {
                return false;
            }
            const thres_ = thres <= 1 ? thres * structure.hitsMax : thres;
            return structure.hits < thres_;
        }
        return getResId(this, FIND_MY_STRUCTURES, opts, filter) as Id<StructureRampart> | null;
    } else {
        throw Error("Only support STRUCTURE_WALL and STRUCTURE_RAMPART.")
    }
    return getResId(this, findType, opts, filter);
}

export function loadRoomPositionExtension() {
    RoomPosition.prototype.findNearestRechargeable = findNearestRechargeable;
    RoomPosition.prototype.findNearestPickable = findNearestPickable;
    RoomPosition.prototype.findNearestBuildable = findNearestBuildable;
    RoomPosition.prototype.findNearestRepairable = findNearestRepairable;
    RoomPosition.prototype.findNearestReinforceable = findNearestReinforceable;
}
