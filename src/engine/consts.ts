export enum Code {
    DONE = "[Done]",
    PROCESSING = "[Processing]",
    FAILED = "[Failed]",
    WAITING = "[Waiting]",
    SUCCESS = "[Success]",
    BUSY = "[Busy]",
    ERROR = "[Error]",
    IDLE = "[Idle]"
}

export const DEFAULT_MOVE_TO_OPTS: MoveToOpts = {
    reusePath: 3,
    visualizePathStyle: {
        stroke: "#ffffff",
    }
}

export enum Emoji {
    HARVEST = "⛏",
    TRANSFER = "📥",
    WITHDRAW = "📤",
    MOVE = "🚴‍♂️",
    UPGRADE = "🆙",
    BUILD = "🧱",
    REPAIR = "🛠",
    OK = "🆗",
    SUCCESS = "✅",
    FAIL = "❌",
    WARNING = "❗",
    END = "🔚",
    REST = "🛏️",
    SEARCH = "🔍",
    PICKUP = "🫳"
}

export enum Color {
    HARVEST = "#b2bec3",
    TRANSFER = "#fdcb6e",
    WITHDRAW = "#ffeaa7",
    PICKUP = "#ffeaa7",
    BUILD = "#0984e3",
    UPGRADE = "#81ecec",
    REPAIR = "#74b9ff",
    HEAL = "#55efc4",
    ATTACK = "#d63031",
    CARRIER = "#fed330",
    WORKER = "#487eb0",
    UPGRADER = "#55efc4",
    HARVESTER = "#e58e26",
    TRANSFERER = "#95a5a6",
    PIONEER = "#f9ca24"
}

export const ENERGY_PER_TICK_PER_SOURCE_CENTER_ROOM =
    SOURCE_ENERGY_KEEPER_CAPACITY / ENERGY_REGEN_TIME;
export const ENERGY_PER_TICK_PER_SOURCE_RESERVED_ROOM =
    SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME;
export const ENERGY_PER_TICK_PER_SOURCE_UNRESERVED_ROOM =
    SOURCE_ENERGY_NEUTRAL_CAPACITY / ENERGY_REGEN_TIME;
