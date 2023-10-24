export class RoleManager {

    /**
     * 加载 role 配置
     */
    public initialize() {}

    public directCreep(creep: Creep) { }

    private static instance: RoleManager | null = null;

    private constructor() { }

    public static getInstance(): RoleManager {
        if (!this.instance) {
            this.instance = new RoleManager();
        }
        return this.instance;
    }
}
