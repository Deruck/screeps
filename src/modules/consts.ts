export enum ReturnCode {
    DONE = "[Done]",
    PROCESSING = "[Processing]",
    FAILED = "[Failed]",
    WAITING = "[Waiting]",
    SUCCESS = "[Success]",
    BUSY = "[Busy]",
    ERROR = "[Error]",
}

export const default_move_to_opts: MoveToOpts = {
    reusePath: 5,
    visualizePathStyle: {
        stroke: "#ffffff",
    }
}
