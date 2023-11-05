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
        "E9N54": {
            pioneer_upgrader: {
                cls: "PioneerUpgrader",
                num: 1,
                body: {
                    work: 1,
                    carry: 1,
                    move: 2
                },
                opts: {
                    sourceId: "5bbcad729099fc012e63747c"
                },
                level: 1
            },
            pioneer1: {
                cls: "Pioneer",
                num: 6,
                body: {
                    work: 1,
                    carry: 1,
                    move: 2
                },
                opts: {
                    sourceId: "5bbcad729099fc012e63747c"
                },
                level: 0
            },
            pioneer2: {
                cls: "Pioneer",
                num: 3,
                body: {
                    work: 1,
                    carry: 1,
                    move: 2
                },
                opts: {
                    sourceId: "5bbcad729099fc012e63747b"
                },
                level: 2
            }
        },
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
