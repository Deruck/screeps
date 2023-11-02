declare global {

    interface HasNameProxy {
        get name(): string
    }

    interface StructureTower extends HasNameProxy { }

}

function loadTowerNameProxy() {
    Object.defineProperty(StructureTower.prototype, "name", {
        get: function (this: StructureTower) {
            return this.id;
        }
    })
}

export function loadNameProxyExtension() {
    loadTowerNameProxy();
}
