import { Singleton } from "./singleton";

class Logger extends Singleton {

    channelSwitches: Map<number, boolean> = new Map<number, boolean>([
        [0,  true]
    ]);

    enableChannel(channel: number) {
        this.channelSwitches.set(channel, true);
    }

    disableChannel(channel: number) {
        this.channelSwitches.set(channel, false);
    }

    debug(message: any, channel: number = 0) {
        if (this.channelSwitches.get(channel)) {
            console.log(`[DEBUG]: ${message}`);
        }
    }

    info(message: any) {
        console.log(`[INFO]: ${message}`);
    }

    error(message: any) {
        console.log(`[ERROR]: ${message}`);
    }

    warn(message: any) {
        console.log(`[WARN]: ${message}`);
    }

// Singleton Interface
static getInstance(): Logger {
   return super.getInstance.call(this) as Logger;
}
}

export const logger = Logger.getInstance();
