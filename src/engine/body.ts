import { memoryManager } from "./memory_manager";
import { registerToGlobal } from "./utils/global";

export type BodypartsMap = Partial<Record<BodyPartConstant, number>>;

export class Body {
    readonly BODYPARTS_ARR: BodyPartConstant[] = [];
    readonly COST: number = 0;
    readonly IS_VALID: boolean;
    readonly SPAWN_TIME: number;

    constructor(
        readonly BODYPARTS: BodypartsMap
    ) {
        for (const bodypart in BODYPARTS) {
            const num = (<any>BODYPARTS)[bodypart] as number;
            this.COST += num * BODYPART_COST[(bodypart as BodyPartConstant)];
            let num_ = num;
            while (num_--) {
                this.BODYPARTS_ARR.push((bodypart as BodyPartConstant));
            }
        }
        this.IS_VALID = this.BODYPARTS_ARR.length <= 50;
        this.SPAWN_TIME = this.BODYPARTS_ARR.length * CREEP_SPAWN_TIME;
    }
}

registerToGlobal(Body, Body.name);
