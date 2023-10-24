import { ReturnCode, default_move_to_opts } from "modules/consts";

export function moveToTarget(this: Creep, targetPos: RoomPosition, range: number, moveToOpts: MoveToOpts = default_move_to_opts) {
    if (this.pos.inRangeTo(targetPos, range)) {
        return ReturnCode.DONE;
    } else {
        var code = this.moveTo(targetPos, moveToOpts);
        if (code == ERR_NOT_FOUND || code == ERR_NO_PATH) {
            this.say(`🔎❌`);
        } else if (code == ERR_TIRED) {
            this.say(`🛌`);
        }
        return ReturnCode.PROCESSING;
    }
}
