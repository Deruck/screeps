import { Singleton } from "./utils/singleton";

declare global {
    interface ConfigIndex { }

    interface Memory {
        configs: ConfigIndex;
    }
}

if (Memory.configs === undefined) {
    // @ts-ignore
    Memory.configs = {}
}

class Config extends Singleton {

    register<K extends keyof ConfigIndex, V extends ConfigIndex[K]>(key: K, defaultValue: V) {
        this.registered.add(key);
        if (key in this.configs) {
            return;
        }
        this.configs[key] = defaultValue;
        console.log(Memory.configs[key]);
    }

    get<K extends keyof ConfigIndex>(key: K): ConfigIndex[K] {
        const value = this.configs[key];
        if (value === undefined) {
            throw Error(`Config ${key} is not registered.`)
        }
        return value;
    }

    set<K extends keyof ConfigIndex, V extends ConfigIndex[K]>(key: K, value: V) {
        if (this.configs[key] === undefined) {
            throw Error(`Config ${key} is not registered.`)
        }
        this.configs[key] = value;
    }

    cleanOnReset() {
        for (const key in this.configs) {
            if (!this.registered.has(key)) {
                delete (this.configs as any)[key];
            }
        }
    }

    private registered: Set<number | string> = new Set();

    private get configs() {
        return Memory.configs;
    }

    // Singleton Interface
    static getInstance(): Config {
        return super.getInstance.call(this) as Config;
    }
}

export const configs = Config.getInstance();
