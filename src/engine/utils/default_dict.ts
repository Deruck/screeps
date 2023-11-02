export class DefaultDict<T>  {
    [key: symbol | string]: T;

    constructor(defaultValue?: T, defaultFactory?: new (property?: symbol | string) => T) {
        if (defaultValue != undefined && defaultFactory != undefined) {
            throw Error("defaultValue and defaultFactory are excluded.")
        } else if (defaultValue != undefined) {
            return new Proxy(this, {
                get(target, property) {
                    if (!target[property]) {
                        target[property] = defaultValue;
                    }
                    return target[property];
                },
                set(target, property, value): boolean {
                    target[property] = value;
                    return true;
                }
            });
        } else if (defaultFactory != undefined) {
            return new Proxy(this, {
                get(target, property) {
                    if (!target[property]) {
                        target[property] = new defaultFactory(property);
                    }
                    return target[property];
                },
                set(target, property, value): boolean {
                    target[property] = value;
                    return true;
                }
            });
        } else {
            throw Error("defaultValue or defaultFactory should be passed.");
        }
    }
}
