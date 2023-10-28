import { Act } from "engine/act/act";
import { Emoji, ReturnCode } from "engine/consts";
import { memoryManager } from "engine/memory_manager";

interface TemplateMemory extends ActMemory {

}

interface TemplateOpts extends ActOpts {

}


export class Template extends Act<Creep> {
    readonly ACT_NAME: string;
    readonly ACT_ICON: Emoji;
    memory: TemplateMemory = {
        id: ""
    }

    constructor(opts?: TemplateOpts) {
        super(opts)
        if (!opts) {
            return;
        }

    }

    protected isActValid(subject: Creep): boolean {
        return true;
    }

    protected exec(subject: Creep) {
        return ReturnCode.PROCESSING;
    }
}

memoryManager.registerClass(Template);
