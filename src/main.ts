import { ErrorMapper } from "engine/utils/error_mapper";
import { ai } from "engine/ai"

ai.runOnReset();

export const loop = ErrorMapper.wrapLoop(() => {
    ai.runOnTick();
});

// 控制台可见项
import { logger } from "engine/utils/logger";

export { logger }
