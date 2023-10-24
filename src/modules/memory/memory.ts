import { clean } from "modules/memory/clean";

declare global {
interface MemoryExtension {
    clean(): void;
}

interface Memory extends MemoryExtension { }
}

const memory_extension: MemoryExtension = {
    clean
}

export function loadMemoryExtension() {
    _.assign(Memory, memory_extension);
}
