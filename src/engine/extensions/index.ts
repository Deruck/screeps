import { loadActExtension } from "./act";
import { loadSpawnExtension } from "./spawn";
import { Singleton } from "../utils/singleton";
import { loadSayExtension } from "./say";
import { loadMemoryProxyExtension } from "./memory";
import { loadNameProxyExtension } from "./name";
import { loadRoomPositionExtension } from "./position";
import { loadCreepExtension } from "./creep";
import { loadRoomExtension } from "./room";

class ExtensionManager extends Singleton {
    loadExtensionsOnReset() {
        loadSpawnExtension();
        loadActExtension();
        loadSayExtension();
        loadMemoryProxyExtension();
        loadNameProxyExtension();
        loadRoomPositionExtension();
        loadCreepExtension();
        loadRoomExtension();
    }

    loadExtensionsOnTick() {

    }

    static getInstance(): ExtensionManager {
        return super.getInstance.call(this) as ExtensionManager;
    }
}

export const extensionManager = ExtensionManager.getInstance();
