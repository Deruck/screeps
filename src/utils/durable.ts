import { getClassName } from 'utils/class_utils';

export class Durable {
    readonly CLASS_NAME: string = getClassName(this);
    memory_trace: string = "";

    constructor() {
        (<any>global)[this.CLASS_NAME] = this.constructor;
    }

    /**初始化
     * 若 Memory 中存在对象，则从 Memory 中初始化，否则同步对象到 Memory
     */
    initialize(memory_trace: string) {
        this.memory_trace = memory_trace;
        let memoryObj: Durable | undefined = eval(`Memory.${memory_trace}`);
        if (memoryObj) {
            Object.assign(this, memoryObj);
        }
        eval(`Memory.${memory_trace} = this;`)
        return this;
    }

    /**删除 Memory 记录*/
    deleteMemory() {
        eval(`delete Memory.${this.memory_trace};`);
        console.log(eval(`Memory.${this.memory_trace}`));
    }

    /**从 Memory 对象中重建对象
     *
     * @param memory_trace 对象在 Memory 中的存储位置，如 "a.b['c']" 代表存储对象通过 "a.b['c']" 访问
     * @returns
     */
    static getInstance<T extends Durable>(memory_trace?: string): T | null {
        let memoryObj: Durable | null = eval(`Memory.${memory_trace}`);
        if (!memoryObj) {
            return null;
        }
        let instance: T = new (<any>global)[memoryObj.CLASS_NAME]();
        Object.assign(instance, memoryObj);
        eval(`Memory.${memory_trace} = instance;`)
        return instance;
    }
}
