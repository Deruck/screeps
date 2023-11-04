import { Role } from "./act/role";
import { Body, BodypartsMap } from "./body";
import { spawnManager } from "./spawn_manager";
import { getClassByName } from "./utils/class";
import { logger } from "./utils/logger";
import { NotifierState, notifierManager } from "./utils/notifier";
import { getPropertyNum } from "./utils/object";
import { Singleton } from "./utils/singleton";

declare global {
    interface Set_ { [key: string | number]: null }

    interface RoleConfig {
        cls: ClassName,
        num: number,
        workingCreeps: Set_,
        spawningCreeps: Set_,
        waitingForSpawningCreeps: {
            [name: string]: NotifierId<pushSpawnCreepNotifierState>
        },
        dyingCreeps: Set_,
        body: BodypartsMap,
        opts: RoleOpts,
        /**孵化优先级*/
        level: number
    }

    interface RoomMemory {
        roleManager: { [roleName: string]: RoleConfig };
    }

    interface Memory {

    }
}

export function initRoleManagerRoomMemoryOnTick() {
    for (const room in Game.rooms) {
        if (!Game.rooms[room].memory.roleManager) {
            Game.rooms[room].memory.roleManager = {}
        }
    }
}

/**
 * 基于角色的策略管理方案
 * * 外界设定 role 类型、参数
 * * 根据参数，监控 role 的孵化、工作情况
 */
class RoleManager extends Singleton {

    run(room: Room): void {
        for (const roleName in this.getMemory(room)) {
            this.manageRole(room, roleName);
        }
    }

    setRole(
        room: Room,
        name: string,
        cls: new (opts: RoleOpts) => Role,
        num: number,
        body: BodypartsMap,
        opts: RoleOpts,
        level: number
    ): void {
        const config = this.getMemory(room)[name]
        if (!config) {
            this.getMemory(room)[name] = {
                cls: cls.name,
                num: num,
                workingCreeps: {},
                waitingForSpawningCreeps: {},
                spawningCreeps: {},
                dyingCreeps: {},
                body: body,
                opts: opts,
                level: level
            }
        } else {
            config.cls = cls.name;
            config.num = num;
            config.body = body;
            config.opts = opts;
            config.level = level;
        }
    }

    getRoleConfig(room: Room, name: string): RoleConfig {
        const config = this.getMemory(room)[name];
        if (!config) {
            throw Error(`Role ${name} does not exist.`)
        }
        return config;
    }

    deleteRole(room: Room, name: string): void {
        const config = this.getRoleConfig(room, name);
        if (!config) {
            return;
        }
        for (const creepName in config.dyingCreeps) {
            Game.creeps[creepName]?.endRole();
            Game.creeps[creepName]?.suicide();
        }
        for (const creepName in config.workingCreeps) {
            Game.creeps[creepName]?.endRole();
            Game.creeps[creepName]?.suicide();
        }
        for (const creepName in config.spawningCreeps) {
            spawnManager.cancelSpawning(room, creepName);
        }
        for (const creepName in config.waitingForSpawningCreeps) {
            spawnManager.quitCreep(room, config.waitingForSpawningCreeps[creepName]);
        }
        delete this.getMemory(room)[name];
    }

    private getMemory(room: Room) {
        return room.memory.roleManager;
    }

    private manageRole(room: Room, name: string) {
        const roleConfig = this.getRoleConfig(room, name);
        // role 合法性检查
        const body = new Body(roleConfig.body);
        if (!body.IS_VALID) {
            logger.error(`Body of role ${name} is not valid.`);
            return;
        }
        if (body.COST > room.energyCapacityAvailable) {
            logger.error(`Cost of role ${name} is too high.`);
            return;
        }
        // 死亡 creep 清理
        this.cleanDeadCreeps(roleConfig.dyingCreeps);
        this.cleanDeadCreeps(roleConfig.spawningCreeps);
        this.cleanDeadCreeps(roleConfig.workingCreeps);
        // 待孵化队列管理
        for (const creepName in roleConfig.waitingForSpawningCreeps) {
            const notifier = roleConfig.waitingForSpawningCreeps[creepName];
            const state = notifierManager.getNotifierState(notifier);
            if (state === undefined) {
                delete roleConfig.waitingForSpawningCreeps[creepName];
                continue;
            }
            if (state === NotifierState.FAILED) {
                notifierManager.deleteNotifier(notifier);
                delete roleConfig.waitingForSpawningCreeps[creepName];
                continue;
            }
            if (state === NotifierState.PROCESSING) {
                notifierManager.deleteNotifier(notifier);
                delete roleConfig.waitingForSpawningCreeps[creepName];
                roleConfig.spawningCreeps[creepName] = null;
                continue;
            }
        }
        // 孵化中 creep 管理
        for (const creepName in roleConfig.spawningCreeps) {
            if (Game.creeps[creepName].spawning) {
                continue;
            }
            const RoleCls = getClassByName<Role>(roleConfig.cls);
            const ret = Game.creeps[creepName].assignRole(
                new RoleCls(roleConfig.opts)
            );
            if (!ret) {
                logger.error(`Role ${name} assigned failed on ${creepName}.`);
                continue;
            }
            delete roleConfig.spawningCreeps[creepName];
            roleConfig.workingCreeps[creepName] = null;
        }

        // 将亡 creep 管理
        for (const creepName in roleConfig.workingCreeps) {
            if (<number>Game.creeps[creepName].ticksToLive <= body.SPAWN_TIME) {
                delete roleConfig.workingCreeps[creepName];
                roleConfig.dyingCreeps[creepName] = null;
            }
        }
        // role 数量管理
        const curNum = getPropertyNum(roleConfig.waitingForSpawningCreeps) +
                       getPropertyNum(roleConfig.spawningCreeps) +
                       getPropertyNum(roleConfig.workingCreeps);
        const numToSpawn = roleConfig.num - curNum;
        for (let i = 0; i < numToSpawn; i++) {
            const creepName = `${name}_${Game.time}_${i}${_.uniqueId()}`;
            const notifierId = spawnManager.pushSpawnCreep(
                room,
                body.BODYPARTS,
                creepName,
                roleConfig.level
            );
            if (notifierId == null) {
                throw Error(`Spawn role ${name} failed.`);
            }
            roleConfig.waitingForSpawningCreeps[creepName] = notifierId;
        }
    }

    private cleanDeadCreeps(creeps: Set_) {
        for (const creepName in creeps) {
            if (!(creepName in Game.creeps)) {
                delete creeps[creepName];
            }
        }
    }

    // Singleton Interface
    static getInstance(): RoleManager {
        return super.getInstance.call(this) as RoleManager;
    }
}

export const roleManager = RoleManager.getInstance();
