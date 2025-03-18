export default abstract class BaseTask {
  name: string;
  interval?: number;
  constructor(name: string, interval: number = 0) {
    this.name = name;
    this.interval = interval;
  }

  invoke(...args: any[]): Promise<any> {
    throw "not yet implemented!";
  }
}
