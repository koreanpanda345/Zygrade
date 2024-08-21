export default interface BaseEvent {
    name: string;
    eventName: string;
    disabled?: boolean;
    onlyOnce: boolean;
    invoke(...args: any[]): Promise<unknown>;
}

export default abstract class BaseEvent {
    constructor(name: string, eventName: string, onlyOnce: boolean = false, disabled: boolean = false) {
        this.name = name;
        this.eventName = eventName;
        this.onlyOnce = onlyOnce;
        this.disabled = disabled;
    }

    public async invoke(...args: any[]) {
        throw 'Not yet implemented';
    }
}
