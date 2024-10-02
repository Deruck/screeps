import { Singleton } from "engine/utils/singleton";
import { logger } from "./utils/logger";

// 临时测试沙盒
class SandBox extends Singleton {
    runOnReset() {

    }

    runOnTick() {

    }

    static getInstance(): SandBox {
        return super.getInstance.call(this) as SandBox;
    }
}

export const sandBox = SandBox.getInstance();
