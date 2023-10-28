import { Singleton } from "./singleton";

class Logger extends Singleton {

    private _verbose = 0;

    set verbose(verbose: number) {
        this._verbose = verbose;
    }

    info(message: any, verbose: number = 0) {
        if (verbose <= this._verbose) {
            console.log(`[INFO]: ${message}`);
        }
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
