import { memoryManager } from "./memory_manager";
import { registerToGlobal } from "./utils/global";

export type BodypartsMap = Partial<Record<BodyPartConstant, number>>;

export class Body {
    readonly BODYPARTS_ARR: BodyPartConstant[] = [];
    readonly COST: number = 0;
    readonly IS_VALID: boolean;

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
    }
}

registerToGlobal(Body, Body.name);
