import { Singleton } from "./utils/singleton";
import { BodypartsMap, Body } from "./body";
import { notifierManager, NotifierState } from "./utils/notifier";
import { registerToGlobal } from "./utils/global";

declare global {
    interface RoomMemory {
        spawnQues: {
            body: BodypartsMap,
            name: string,
            opts?: SpawnOptions,
            notifierId: NotifierId<pushSpawnCreepNotifierState>
        }[][]
    }
}

export function initSpawnquesRoomMemoryOnTick() {
    for (const room in Game.rooms) {
        if (Game.rooms[room].memory.spawnQues === undefined) {
            Game.rooms[room].memory.spawnQues = [];
        }
    }
}

class SpawnManager extends Singleton {

    run(room: Room): void {
        const spawns = room.findMySpawns(true);
        if (spawns.length === 0) {
            return;
        }
        const spawn = spawns[0];
        if (spawn.spawning || !this.getSpawnQues(room)) {
            return;
        }
        for (const que of this.getSpawnQues(room)) {
            if (que.length > 0) {
                const spawnOpts = que[0];
                const ret = spawn.spawnCreep(
                    new Body(spawnOpts.body),
                    spawnOpts.name,
                    spawnOpts.opts
                )
                switch (ret) {
                    case OK:
                        que.shift();
                        notifierManager.setNotifierState(
                            spawnOpts.notifierId,
                            NotifierState.PROCESSING
                        );
                        break;
                    case ERR_NOT_ENOUGH_ENERGY:
                        break;
                    default:
                        spawn.say(`${ret}`);
                        que.shift();
                        notifierManager.setNotifierState(
                            spawnOpts.notifierId,
                            NotifierState.FAILED
                        );
                        break;
                }
                break;
            }
        }
        // 清理多级队列
        for (let i = this.getSpawnQues(room).length - 1; i >= 0; i--) {
            if (this.getSpawnQues(room)[i].length > 0) {
                break;
            }
            this.getSpawnQues(room).pop();
        }
    }

    pushSpawnCreep(
        room: Room,
        body: BodypartsMap,
        name: string,
        level: number,
        opts?: SpawnOptions,
        doJumpQue: boolean = false
    ): NotifierId<pushSpawnCreepNotifierState> | null {
        const bodyObj = new Body(body)
        if (!bodyObj.IS_VALID || bodyObj.COST > room.energyCapacityAvailable) {
            return null;
        }
        if (this.getSpawnQues(room)[level] === undefined) {
            for (let i = this.getSpawnQues(room).length; i <= level; i++) {
                this.getSpawnQues(room).push([]);
            }
        }
        const notifierId = notifierManager.getNewNotifier(NotifierState.WAITING);
        const spawnOpts = {
            body: body,
            name: name,
            opts: opts,
            notifierId: notifierId
        };
        if (doJumpQue) {
            this.getSpawnQues(room)[level].unshift(spawnOpts);
        } else {
            this.getSpawnQues(room)[level].push(spawnOpts);
        }
        return notifierId;
    }

    quitCreep(room: Room, notifierId: NotifierId<pushSpawnCreepNotifierState>): void {
        for (let i = 0; i < this.getSpawnQues(room).length; i++) {
            for (let j = 0; j < this.getSpawnQues(room)[i].length; j++) {
                if (this.getSpawnQues(room)[i][j].notifierId === notifierId) {
                    notifierManager.deleteNotifier(notifierId);
                    this.getSpawnQues(room)[i].splice(j, 1);
                    return;
                }
            }
        }
    }

    getSpawnings(room: Room): Spawning[] {
        return room.findMySpawns(false)
                   .map((s: StructureSpawn) => s.spawning)
                   .filter((s) => s != null) as Spawning[];
    }

    cancelSpawning(room: Room, creepName: string) {
        for (const spawning of this.getSpawnings(room)) {
            if (spawning.name === creepName) {
                spawning.cancel();
                return;
            }
        }
    }

    private getSpawnQues(room: Room) {
        return room.memory.spawnQues
    }

    // Singleton Interface
    static getInstance(): SpawnManager {
        return super.getInstance.call(this) as SpawnManager;
    }
}

export const spawnManager = SpawnManager.getInstance();
registerToGlobal(spawnManager, "spawnManager");
