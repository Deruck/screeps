import { Act } from "engine/act/act";
import { DEFAULT_MOVE_TO_OPTS, Emoji, Code } from "engine/consts";
import { memoryManager } from "engine/memory_manager";

interface MoveMemory extends ActMemory {
    x: number;
    y: number;
    range: number;
    room?: string;
    reusePath?: number;
    serializeMemory?: boolean;
    noPathFinding?: boolean;
    visualizePathStyle?: PolyStyle;
}

interface MoveOpts extends ActOpts {
    x: number;
    y: number;
    range?: number;
    room?: string;
    reusePath?: number;
    serializeMemory?: boolean;
    noPathFinding?: boolean;
    visualizePathStyle?: PolyStyle;
}


export class Move extends Act<Creep> {
    readonly ACT_NAME: string = "MOVE"
    readonly ACT_ICON: Emoji = Emoji.MOVE;
    memory: MoveMemory = {
        id: "",
        x: -1,
        y: -1,
        range: 0
    }

    constructor(opts?: MoveOpts) {
        super(opts)
        if (!opts) {
            return;
        }
        this.memory.x = opts.x;
        this.memory.y = opts.y;
        this.memory.range = (opts.range != undefined) ? opts.range : 0;
        this.memory.room = opts.room;
        this.memory.reusePath = (opts.reusePath != undefined) ? opts.reusePath : DEFAULT_MOVE_TO_OPTS.reusePath;
        this.memory.serializeMemory = (opts.serializeMemory != undefined) ? opts.serializeMemory : DEFAULT_MOVE_TO_OPTS.serializeMemory;
        this.memory.noPathFinding = (opts.noPathFinding != undefined) ? opts.noPathFinding : DEFAULT_MOVE_TO_OPTS.noPathFinding;
        this.memory.visualizePathStyle = (opts.visualizePathStyle != undefined) ? opts.visualizePathStyle : DEFAULT_MOVE_TO_OPTS.visualizePathStyle;
    }

    protected isActValid(subject: Creep): boolean {
        return subject.getActiveBodyparts(MOVE) > 0;
    }

    protected isEnd(subject: Creep): boolean {
        return subject.pos.inRangeTo(this.memory.x, this.memory.y, this.memory.range);
    }

    protected exec(subject: Creep) {
        if (this.isEnd(subject)) {
            return Code.DONE;
        }
        const ret = subject.moveTo(
            this.memory.x,
            this.memory.y,
            {
                reusePath: this.memory.reusePath,
                serializeMemory: this.memory.serializeMemory,
                noPathFinding: this.memory.noPathFinding,
                visualizePathStyle: this.memory.visualizePathStyle
            }
        );
        switch (ret) {
            case OK:
                subject.say(Emoji.MOVE);
                break;
            case ERR_TIRED:
                subject.say(Emoji.REST);
                break;
            case ERR_NO_PATH:
                subject.say(`${Emoji.SEARCH}${Emoji.FAIL}`);
                break;
            case ERR_NO_BODYPART:
                return Code.FAILED;
            default:
                subject.say(`${this.ACT_ICON}${ret}`);
                break;
        }
        return Code.PROCESSING;
    }
}

memoryManager.registerClass(Move);
