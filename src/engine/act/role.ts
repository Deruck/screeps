/**
 * Role 代表一类循环工作
 */

import { memoryManager } from "engine/memory_manager";
import { Act, CanActType } from "./act";
import { logger } from "engine/utils/logger";

type RoleName = string;

declare global {

    interface RoleMemory { }

    interface CanActMemory {
        role?: RoleMemory
        roleName?: RoleName
    }

    type Color = string;
}

export abstract class Role<T extends CanActType> implements HasMemory {
    abstract memory: RoleMemory;
    abstract readonly NAME: RoleName;
    abstract readonly COLOR: string;
    protected isInitFailed: boolean = false;

    assignTo(subject: T): boolean {
        if (this.isInitFailed) {
            logger.error(`Role ${this.NAME} init failed on ${subject.name}.`);
            return false;
        }
        if (!this.isValid(subject)) {
            logger.error(`Role ${this.NAME} is invalid on ${subject.name}.`);
            return false;
        }
        subject.endRole();
        (subject.role as Role<T>) = this;
        memoryManager.set(this, Role.getRoleMemoryDest(subject));
        subject.memory.roleName = this.NAME;
        return true;
    }

    endRole(subject: T) {
        memoryManager.delete(Role.getRoleMemoryDest(subject));
        delete subject.memory.roleName;
        if (subject.act) {
            (subject.act as Act<T>).endAct(subject);
        }
    }

    run(subject: T) {
        if (subject instanceof Creep) {
            subject.circle(this.COLOR);
        }
        if (!subject.isIdle()) {
            return;
        }
        const ret = this.assignAct(subject);
        if (!ret) {
            logger.error(`Role ${this.NAME} assignment failed on ${subject.name}.`);
        }
    }

    static initRoleOnTick(subject: CanActType): void {
        if (!subject.memory.role) {
            return;
        }
        subject.role = memoryManager.load(Role.getRoleMemoryDest(subject));
        if (!subject.role) {
            memoryManager.delete(Role.getRoleMemoryDest(subject));
        }
    }

    abstract isValid(subject: T): boolean;
    abstract assignAct(subject: T): boolean;

    private static getRoleMemoryDest(subject: CanActType): string {
        if (subject instanceof Creep) {
            return `creeps["${subject.name}"].role`;
        }
        throw Error("getActMemoryDest: unsupported type.");
    }
}
