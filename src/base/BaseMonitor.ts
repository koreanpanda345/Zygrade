

export default abstract class BaseMonitor {
  name: string;
  ignoreBots?: boolean;
  ignoreOthers?: boolean;
  ignoreEdits?: boolean;
  ignoreDM?: boolean;
  constructor(name: string) {
    this.name = name;
  }
  invoke(...args: any[]): Promise<any> {
    throw "not yet implemented";
  }
}
