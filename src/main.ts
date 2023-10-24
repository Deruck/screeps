import { ErrorMapper } from "utils/error_mapper";
import { Ai } from "modules/ai"

Ai.getInstance().runOnReset();

export const loop = ErrorMapper.wrapLoop(() => {
    Ai.getInstance().runOnTick();
});
