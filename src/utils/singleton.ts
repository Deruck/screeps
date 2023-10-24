
/**单例基类
 * 除继承外，还需粘贴以下代码：
 * ```typescript
 * static getInstance(): CLASS_NAME {
 *     return super.getInstance.call(this) as CLASS_NAME;
 * }
 * ```
 */
export class Singleton {
    private static instance: any | undefined = undefined;
    protected constructor() { };
    static getInstance(): any {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    }
}
