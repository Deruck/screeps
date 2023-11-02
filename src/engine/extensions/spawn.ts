import { Body, BodypartsMap } from "engine/body";
import { notifierManager } from "engine/utils/notifier";
import { isUndefined } from "lodash";

declare global {
    type pushSpawnCreepNotifierState =
        NotifierState.DONE |
        NotifierState.WAITING |
        NotifierState.PROCESSING |
        NotifierState.FAILED

    interface StructureSpawn {
        spawnCreep_(body: BodyPartConstant[], name: string, opts?: SpawnOptions): ScreepsReturnCode;
        spawnCreep(body: Body, name: string, opts?: SpawnOptions): ScreepsReturnCode;
        run(): void;
        pushSpawnCreep(
            body: BodypartsMap, name: string, level: number, opts?: SpawnOptions
        ): NotifierId<pushSpawnCreepNotifierState> | null;
    }

    interface SpawnMemory {
        spawnCreepQues: {
            body: BodypartsMap,
            name: string,
            opts?: SpawnOptions,
            notifierId: NotifierId<pushSpawnCreepNotifierState>
        }[][];
    }
}

function spawnCreep(this: StructureSpawn, body: Body | BodyPartConstant[], name: string, opts?: SpawnOptions): ScreepsReturnCode {
    if (body instanceof Body) {
        return this.spawnCreep_(body.BODYPARTS_ARR, name, opts);
    }
    return this.spawnCreep_(body, name, opts);
}

function run(this: StructureSpawn): void {
    if (this.spawning || !this.memory.spawnCreepQues) {
        return;
    }
    for (const que of this.memory.spawnCreepQues) {
        if (que.length > 0) {
            const spawnOpts = que[0];
            const ret = this.spawnCreep(
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
                    this.say(`${ret}`);
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
    for (let i = this.memory.spawnCreepQues.length - 1; i >= 0; i--) {
        if (this.memory.spawnCreepQues[i].length > 0) {
            break;
        }
        this.memory.spawnCreepQues.pop();
    }
}

function pushSpawnCreep(
    this: StructureSpawn,
    body: BodypartsMap,
    name: string,
    level: number,
    opts?: SpawnOptions,
    doJumpQue: boolean = false
): NotifierId<pushSpawnCreepNotifierState> | null {
    const bodyObj = new Body(body)
    if (!bodyObj.IS_VALID || bodyObj.COST > this.room.energyCapacityAvailable) {
        return null;
    }
    if (isUndefined(this.memory.spawnCreepQues)) {
        this.memory.spawnCreepQues = [];
    }
    if (isUndefined(this.memory.spawnCreepQues[level])) {
        for (let i = this.memory.spawnCreepQues.length; i <= level; i++) {
            this.memory.spawnCreepQues.push([]);
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
        this.memory.spawnCreepQues[level].unshift(spawnOpts);
    } else {
        this.memory.spawnCreepQues[level].push(spawnOpts);
    }
    return notifierId;
}

export function loadSpawnExtension() {
    StructureSpawn.prototype.spawnCreep_ = StructureSpawn.prototype.spawnCreep;
    StructureSpawn.prototype.spawnCreep = spawnCreep;
    StructureSpawn.prototype.run = run;
    StructureSpawn.prototype.pushSpawnCreep = pushSpawnCreep;
}
