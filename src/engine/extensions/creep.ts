declare global {

    interface Creep {
        circle(color: string): void;
    }

}

function circle(this: Creep, color: string) {
    this.room.visual.circle(this.pos, {
        radius: 0.6,
        opacity: 0.2,
        stroke: color
    });
}

export function loadCreepExtension() {
    Creep.prototype.circle = circle;
}
