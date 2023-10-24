export class Role {
    body: Map<BodyPartConstant, number>;
    spawn_opts?: SpawnOptions;
    role_type: Role.RoleType;
    num: number;
    cur_num: number = 0;


}

export namespace Role {
    export enum RoleType {
        PIONEER = "PIONEER"
    }
}
