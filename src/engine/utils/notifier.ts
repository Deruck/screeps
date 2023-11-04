import { Singleton } from "./singleton";

declare global {
    type NotifierId<T extends NotifierState> = string & Tag.OpaqueTag<T>;

    interface Memory {
        notifiers: { [id: NotifierId<NotifierState>]: NotifierState; }
    }
}

export enum NotifierState {
    UNINITIALIZED = 0,
    WAITING = 1,
    PROCESSING = 2,
    DONE = 3,
    FAILED = 4
}

/**用于对象之间传递回调信息 */
class NotifierManager extends Singleton {

    constructor() {
        super();
        if (!Memory.notifiers) {
            Memory.notifiers = {};
        }
    }

    getNewNotifier<T extends NotifierState>(
        defaultState: T
    ): NotifierId<T> {
        let id = `${Game.time}_${_.uniqueId()}` as NotifierId<T>;
        while (id in Memory.notifiers) {
            id = `${Game.time}_${_.uniqueId()}_${_.random(100, 999)}` as NotifierId<T>;
        }
        Memory.notifiers[id] = defaultState;
        return id;
    }

    getNotifierState<T extends NotifierState>(
        id: NotifierId<T>
    ): T | undefined {
        return Memory.notifiers[id] as T;
    }

    setNotifierState<T extends NotifierState>(
        id: NotifierId<T>, state: T
    ): void {
        if (Memory.notifiers[id] != undefined) {
            Memory.notifiers[id] = state;
        }
    }

    deleteNotifier(id: NotifierId<NotifierState>): void {
        delete Memory.notifiers[id];
    }

    // Singleton Interface
    static getInstance(): NotifierManager {
        return super.getInstance.call(this) as NotifierManager;
    }
}

export const notifierManager = NotifierManager.getInstance();
