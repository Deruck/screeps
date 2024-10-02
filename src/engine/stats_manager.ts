import { logger } from "engine/utils/logger";
import { Singleton } from "engine/utils/singleton";

class StatsManager extends Singleton {
    logOnReset() {
        logger.info("Global Reset");
    };

    logOnTickStart() {
        logger.info(`Current game tick is ${Game.time}.`);
    }

    logOnTickEnd() { }

    // Singleton Interface
    static getInstance(): StatsManager {
        return super.getInstance.call(this) as StatsManager;
    }
}

export const statsManager = StatsManager.getInstance();
