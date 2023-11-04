import { Act } from "engine/act/act";
import { Color, Emoji, Code } from "engine/consts";
import { memoryManager } from "engine/memory_manager";
import { Move } from "./move";

declare global {
    type Harvestable = Mineral | Source | Deposit;
}

interface HarvestMemory extends ActMemory {
    targetId: Id<Harvestable>,
    needCarry: boolean,
    needMove: boolean,
    pos?: {
        x: number,
        y: number
    }
}

interface HarvestOpts extends ActOpts {
    targetId: Id<Harvestable>,
    needCarry?: boolean,
    needMove?: boolean,
    /**
     * 固定位置采集
     */
    pos?: { x: number, y: number }
}


export class Harvest extends Act {
    readonly ACT_NAME: string = "HARVEST"
    readonly ACT_ICON: Emoji = Emoji.HARVEST;
    memory: HarvestMemory = {
        //@ts-ignore
        targetId: ""
    }

    constructor(opts?: HarvestOpts) {
        super(opts)
        if (!opts) {
            return;
        }
        this.memory.targetId = opts.targetId;
        const source = this.getResource();
        if (!(
            source instanceof Source ||
            source instanceof Mineral ||
            source instanceof Deposit
        )) {
            this.isInitFailed = true;
            return;
        }
        this.memory.needCarry = (opts.needCarry != undefined)? opts.needCarry: true;
        this.memory.needMove = (opts.needMove != undefined)? opts.needMove: true;
        this.memory.pos = opts.pos;
    }

    protected isActValid(subject: Creep): boolean {
        if (
            this.memory.needCarry &&
            (subject.getActiveBodyparts(CARRY) === 0)
        ) {
            return false;
        }
        if (
            this.memory.needMove &&
            subject.getActiveBodyparts(MOVE) === 0
        ) {

            return false;
        }
        return subject.getActiveBodyparts(WORK) > 0;
    }

    protected exec(subject: Creep) {
        if (this.memory.needCarry && this.getResourceCapacity(subject) <= 0) {
            return Code.DONE;
        }
        if (
            this.memory.pos &&
            !subject.pos.inRangeTo(this.memory.pos.x, this.memory.pos.y, 0)
        ) {
            subject.assignAct(
                new Move({
                    x: this.memory.pos.x,
                    y: this.memory.pos.y,
                    range: 0,
                    visualizePathStyle: {
                        stroke: Color.HARVEST
                    }
                }),
                true
            );
            return Code.PROCESSING;
        }
        const ret = subject.harvest(this.getResource());
        switch (ret) {
            case OK:
                subject.say(`${this.ACT_ICON}`);
                break;
            case ERR_NOT_IN_RANGE:
                const target = this.getResource();
                subject.assignAct(
                    new Move({
                        x: target.pos.x,
                        y: target.pos.y,
                        range: 1,
                        visualizePathStyle: {
                            stroke: Color.HARVEST
                        }
                    }),
                    true
                );
                return Code.PROCESSING;
            default:
                subject.say(`${this.ACT_ICON}${ret}`);
                break;
        }
        return Code.PROCESSING;
    }

    private getResourceType(source: Harvestable): ResourceConstant {
        if (source instanceof Source) {
            return RESOURCE_ENERGY;
        }
        if (source instanceof Mineral) {
            return source.mineralType;
        }
        if (source instanceof Deposit) {
            return source.depositType;
        }
        else {
            throw Error("invalid source type");
        }
    }

    private getResource(): Harvestable {
        return Game.getObjectById(this.memory.targetId) as Harvestable;
    }

    private getResourceCapacity(subject: Creep) {
        return subject.store.getFreeCapacity(this.getResourceType(this.getResource())) as number;
    }
}

memoryManager.registerClass(Harvest);
