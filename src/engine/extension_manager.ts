import { loadActExtension } from "./act/extension";
import { Singleton } from "./utils/singleton";

class ExtensionManager extends Singleton {
    loadExtensionsOnReset() { }

    loadExtensionsOnTick() {
        loadActExtension();
    }

    static getInstance(): ExtensionManager {
        return super.getInstance.call(this) as ExtensionManager;
    }
}

export const extensionManager = ExtensionManager.getInstance();
