import { ReturnCode } from "modules/consts";
import { moveToTarget } from "modules/creep/move_to_target";

declare global {
interface CreepExtension {
    moveToTarget(targetPos: RoomPosition, range: number, moveToOpts: MoveToOpts): ReturnCode;
}

interface Creep extends CreepExtension { }
}

const creep_extension: CreepExtension = {
    moveToTarget
}

function loadCreepExtension() {
    _.assign(Creep.prototype, creep_extension);
}

export { loadCreepExtension };
