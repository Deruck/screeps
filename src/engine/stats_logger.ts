import { logger } from "engine/utils/logger";
import { Singleton } from "engine/utils/singleton";

class StatsLogger extends Singleton {
    logOnReset() {
        logger.info("Global Reset");
    };

    logOnTickStart() {
        logger.info(`Current game tick is ${Game.time}.`);
    }

    logOnTickEnd() { }

    // Singleton Interface
    static getInstance(): StatsLogger {
        return super.getInstance.call(this) as StatsLogger;
    }
}

export const statsLogger = StatsLogger.getInstance();
