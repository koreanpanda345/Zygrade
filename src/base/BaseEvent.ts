export default abstract class BaseEvent {
  name: string;
  onlyOnce?: boolean;
  constructor(name: string, onlyOnce: boolean = false) {
    this.name = name;
    this.onlyOnce = onlyOnce;
  }

  public async invoke(...args: any[]): Promise<any> {
    throw "Not yet implemented";
  }
}
