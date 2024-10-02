import { Body, BodypartsMap } from "engine/body";
import { isUndefined } from "lodash";

declare global {
    interface StructureSpawn {
        __spawnCreep(body: BodyPartConstant[], name: string, opts?: SpawnOptions): ScreepsReturnCode;
        spawnCreep(body: Body, name: string, opts?: SpawnOptions): ScreepsReturnCode;
        run(): void;
    }
}

function spawnCreep(this: StructureSpawn, body: Body | BodyPartConstant[], name: string, opts?: SpawnOptions): ScreepsReturnCode {
    if (body instanceof Body) {
        return this.__spawnCreep(body.BODYPARTS_ARR, name, opts);
    }
    return this.__spawnCreep(body, name, opts);
}

export function loadSpawnExtension() {
    StructureSpawn.prototype.__spawnCreep = StructureSpawn.prototype.spawnCreep;
    StructureSpawn.prototype.spawnCreep = spawnCreep;
}
