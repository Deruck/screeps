import { loadMemoryExtension } from "modules/memory/memory";

export class ExtensionManager {
    static loadExtensionsOnReset() { }

    static loadExtensionsOnTick() {
        loadMemoryExtension();
    }
}
