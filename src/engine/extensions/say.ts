
declare global {
    interface CanSay {
        say(message: string, toPublic?: boolean): OK | ERR_NOT_OWNER | ERR_BUSY;
        pos: RoomPosition
    }

    interface StructureTower extends CanSay { }
    interface StructureSpawn extends CanSay { }
}

function say(this: CanSay, message: string, toPublic?: boolean) {
    const roomName = this.pos.roomName;
    const x = this.pos.x;
    const y = this.pos.y > 2? this.pos.y - 2 : this.pos.y + 2;
    const pos = new RoomPosition(x, y, roomName);
    Game.map.visual.text(message, pos);
    return OK;
}

export function loadSayExtension() {
    StructureSpawn.prototype.say = say;
    StructureTower.prototype.say = say;
}
