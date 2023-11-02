export function registerToGlobal(obj: any, name: string) {
    (<any>global)[name]= obj;
}
