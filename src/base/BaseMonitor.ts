export default interface BaseMonitor {
    name: string;
    disabled?: boolean;
    invoke(...args: any[]): Promise<unknown>;
}

export default abstract class BaseMonitor {
    constructor(name: string, disabled: boolean = false) {
        this.name = name;
        this.disabled = disabled;
    }

    public async invoke(...args: any[]) {
        throw 'Not yet implemented';
    }
}
