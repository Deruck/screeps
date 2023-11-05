import { Singleton } from "./utils/singleton";
import { configs } from "./configs";
import { roleManager } from "./role_manager";
import { getClassByName } from "./utils/class";
import { Body } from "./body";

class Headquarters extends Singleton {

    runOnTick(): void {
        const roleConfigs = configs.get("roles");
        for (const roomName in roleConfigs) {
            if (!(roomName in Game.rooms)) {
                continue;
            }
            const room = Game.rooms[roomName];
            for (const roleName in roleConfigs[roomName]) {
                const roleConfig = roleConfigs[roomName][roleName];
                // TODO 暂时
                const baseBody = new Body(roleConfig.body);
                const times = Math.floor(room.energyCapacityAvailable / baseBody.COST)
                const bodyMap = roleConfig.body;
                for (const bodyName in bodyMap) {
                    //@ts-ignore
                    bodyMap[bodyName] *= times;
                }
                if (new Body(bodyMap).COST <= room.energyCapacityAvailable) {
                    roleConfig.body = bodyMap;
                }
                // TODO end

                roleManager.setRole(
                    room,
                    roleName,
                    getClassByName(roleConfig.cls),
                    roleConfig.num,
                    roleConfig.body,
                    roleConfig.opts,
                    roleConfig.level
                )
            }
        }
    }

    // Singleton Interface
    static getInstance(): Headquarters {
        return super.getInstance.call(this) as Headquarters;
    }
}

export const hq = Headquarters.getInstance();
