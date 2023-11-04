import { Act } from "../act/act";
import { Code } from "engine/consts";
import { Role } from "engine/act/role";

declare global {

    interface Creep {
        runAct():
            Code.DONE |
            Code.FAILED |
            Code.PROCESSING |
            Code.IDLE;
        assignAct(act: Act, chain?: boolean): boolean;
        endAct(): void;
        endRole(): void;
        /**按先后顺序设置行动链 */
        assignActChain(actChain: Act[], chian: boolean): boolean;
        getActName(): string | undefined;
        isIdle(): boolean;
        act?: Act;

        runRole(): boolean;
        assignRole(role: Role): boolean;
        role?: Role;
    }
}

function runAct(this: Creep) {
    Act.initActOnTick(this);
    if (this.act) {
        const ret = (this.act as Act).run(this);
        this.memory.lastActStatus = ret;
        return ret;
    }
    return Code.IDLE;
}

function runRole(this: Creep) {
    Role.initRoleOnTick(this);
    if (this.role) {
        (this.role as Role).run(this);
    }
    return true;
}

function assignAct(this: Creep, act: Act, chain: boolean = false) {
    return act.assignTo(this, chain);
}

function assignRole(this: Creep, role: Role): boolean {
    return role.assignTo(this);
}

function endAct(this: Creep) {
    if (this.act) {
        (this.act as Act).endAct(this, false);
    }
}

function endRole(this: Creep) {
    if (this.role) {
        (this.role as Role).endRole(this);
    }
}

function assignActChain(this: Creep, actChain: Act[], chain: boolean = false) {
    const revertActId = this.act?.memory.id;
    const revertAct = function (subject: Creep) {
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

function isIdle(this: Creep): boolean {
    return this.memory.act == undefined;
}

function getActName(this: Creep) {
    if (this.act) {
        return this.act.ACT_NAME;
    }
    return undefined;
}

export function loadActExtension() {
    Creep.prototype.runAct = runAct;
    Creep.prototype.assignAct = assignAct;
    Creep.prototype.assignActChain = assignActChain;
    Creep.prototype.getActName = getActName;
    Creep.prototype.isIdle = isIdle;
    Creep.prototype.endAct = endAct;
    Creep.prototype.assignRole = assignRole;
    Creep.prototype.runRole = runRole;
    Creep.prototype.endRole = endRole;
}
