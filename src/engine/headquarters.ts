import { Singleton } from "./utils/singleton";
import { configs } from "./configs";
import { roleManager } from "./role_manager";
import { getClassByName } from "./utils/class";

class Headquarters extends Singleton {

    runOnTick(): void {
        const roleConfigs = configs.get("roles");
        for (const room in roleConfigs) {
            if (!(room in Game.rooms)) {
                continue;
            }
            for (const roleName in roleConfigs[room]) {
                const roleConfig = roleConfigs[room][roleName];
                roleManager.setRole(
                    Game.rooms[room],
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
