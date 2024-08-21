export default interface BaseFunc {
    name: string;
    invoke(...args: any[]): Promise<any>;
}

export default abstract class BaseFunc {
    constructor(name: string) {
        this.name = name;
    }

    public async invoke(...args: any[]): Promise<any> {
        throw 'Not yet implemented';
    }
}
