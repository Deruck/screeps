declare global {

    interface TowerMemory extends MemoryObj { }

    interface StructureTower {
        get memory(): TowerMemory;
    }

    interface Memory {
        towers: { [id: string]: TowerMemory };
    }
}

function loadTowerMemoryProxy() {
    if (!Memory.towers) {
        Memory.towers = {};
    }
    Object.defineProperty(StructureTower.prototype, "memory", {
        get: function (this: StructureTower) {
            if (!Memory.towers[this.id]) {
                Memory.towers[this.id] = {};
            }
            return Memory.towers[this.id];
        }
    })
}

export function loadMemoryProxyExtension() {
    loadTowerMemoryProxy();
}
