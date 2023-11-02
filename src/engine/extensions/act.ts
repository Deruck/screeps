import { logger } from "engine/utils/logger";
import { CanActType, Act } from "../act/act";
import { memoryManager } from "engine/memory_manager";
import { Code } from "engine/consts";
import { Role } from "engine/act/role";

declare global {

    interface Constructor<T extends _HasId> extends _Constructor<T>, _ConstructorById<T> {}

    interface CanAct<T extends CanActType> {
        runAct():
            Code.DONE |
            Code.FAILED |
            Code.PROCESSING |
            Code.IDLE;
        assignAct(act: Act<T>, chain?: boolean): boolean;
        endAct(): void;
        endRole(): void;
        /**按先后顺序设置行动链 */
        assignActChain(actChain: Act<T>[], chian: boolean): boolean;
        getActName(): string | undefined;
        isIdle(): boolean;
        act?: Act<T>;

        runRole(): boolean;
        assignRole(role: Role<T>): boolean;
        role?: Role<T>;
    }

    interface Creep extends CanAct<Creep> { }

    interface StructureTower extends CanAct<StructureTower> { }
}

function runAct(this: CanAct<CanActType>) {
    if (this instanceof Creep) {
        Act.initActOnTick(this);
    } else {
        return Code.FAILED;
    }
    if (this.act) {
        const ret = (this.act as Act<typeof this>).run(this);
        this.memory.lastActStatus = ret;
        return ret;
    }
    return Code.IDLE;
}

function runRole(this: CanAct<CanActType>) {
    if (this instanceof Creep) {
        Role.initRoleOnTick(this);
    } else {
        return false;
    }
    if (this.role) {
        (this.role as Role<typeof this>).run(this);
    }
    return true;
}

function assignAct(this: CanActType, act: Act<CanActType>, chain: boolean = false) {
    return act.assignTo(this, chain);
}

function assignRole(this: CanActType, role: Role<CanActType>): boolean {
    return role.assignTo(this);
}

function endAct<T extends CanActType>(this: T) {
    if (this.act) {
        (this.act as Act<T>).endAct(this, false);
    }
}

function endRole<T extends CanActType>(this: T) {
    if (this.role) {
        (this.role as Role<T>).endRole(this);
    }
}

function assignActChain(this: CanActType, actChain: Act<CanActType>[], chain: boolean = false) {
    const revertActId = this.act?.memory.id;
    const revertAct = function (subject: CanActType) {
        if (chain && revertActId != undefined) {
            while (subject.act && subject.act.memory.id != revertActId) {
                //@ts-ignore
                this.act.endAct(this);
            }
        }
    }
    if (!this.assignAct(actChain[actChain.length - 1], chain)) {
        revertAct(this);
        return false;
    }
    for (let i = actChain.length - 2; i >= 0; i--) {
        if (!this.assignAct(actChain[i], true)) {
            revertAct(this);
            return false;
        }
    }
    return true;
}

function isIdle(this: CanActType): boolean {
    return this.memory.act == undefined;
}

function getActName(this: CanActType) {
    if (this.act) {
        return this.act.ACT_NAME;
    }
    return undefined;
}

export function loadActExtension() {
    const loadClass = function <T extends CanActType> (cls: Constructor<T>) {
        cls.prototype.runAct = runAct;
        cls.prototype.assignAct = assignAct;
        cls.prototype.assignActChain = assignActChain;
        cls.prototype.getActName = getActName;
        cls.prototype.isIdle = isIdle;
        cls.prototype.endAct = endAct;
        cls.prototype.assignRole = assignRole;
        cls.prototype.runRole = runRole;
        cls.prototype.endRole = endRole;
    }
    loadClass(Creep);
    loadClass(StructureTower);
}
