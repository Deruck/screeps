import { ErrorMapper } from "engine/utils/error_mapper";
import { ai } from "engine/ai"

export const loop = ErrorMapper.wrapLoop(() => {
    ai.runOnTick();
});

// 控制台可见项加载
import {
    Move,
    Harvest,
    Build,
    Upgrade,
    Transfer,
    Pickup,
    Repair,
    Withdraw
} from "acts"
import { Body } from "engine/body";
import { Pioneer } from './roles';
import { configs } from "./configs";
import { spawnManager } from './engine/spawn_manager';
import { PioneerUpgrader } from './roles/pioneer_upgrader';

export {
    Move,
    Harvest,
    Build,
    Upgrade,
    Transfer,
    Pickup,
    Repair,
    Withdraw,
    Body,
    Pioneer,
    configs,
    spawnManager,
    PioneerUpgrader
};

ai.runOnReset();
