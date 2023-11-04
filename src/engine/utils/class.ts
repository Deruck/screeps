import { registerToGlobal } from "./global";

export function getClassByNameName(obj: Object): string {
    return obj.constructor.name;
}

export function registerClass<T extends Object>(cls: new (...param: any[]) => T): void {
    registerToGlobal(cls, cls.name);
}

export function getClassByName<T extends Object>(name: string): new (...param: any[]) => T {
    const res = (global as any)[name];
    if (res === undefined) {
        throw Error(`Register class ${name} by registerClass(${name}) first.`);
    }
    if (typeof res !== "function") {
        throw Error(`${name} is not a class.`)
    }
    return res;
}
