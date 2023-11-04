import { configs } from "engine/configs";
import { BodypartsMap } from "engine/body";
export { configs };

declare global {

    interface ConfigIndex {
        roles: {
            [room: string]: {
                [roleName: string]: {
                    cls: ClassName,
                    num: number,
                    body: BodypartsMap
                    opts: RoleOpts,
                    /**孵化优先级*/
                    level: number
                }
            };
};
    }

}

// registers
configs.register("roles", {});

// sets
configs.set(
    "roles",
    {
        "sim": {
            pioneer1: {
                cls: "Pioneer",
                num: 4,
                body: {
                    work: 1,
                    carry: 1,
                    move: 2
                },
                opts: {
                    sourceId: "370efb71fac009b12d71f7e4"
                },
                level: 0
            },
            pioneer2: {
                cls: "Pioneer",
                num: 6,
                body: {
                    work: 1,
                    carry: 1,
                    move: 2
                },
                opts: {
                    sourceId: "0b152710fa29dbd35844ac38"
                },
                level: 0
            }
        }
    }
)
