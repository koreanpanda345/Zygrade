export default abstract class BaseProcess {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  invoke(...args: any[]): Promise<any> {
    throw "not yet implemented";
  }
}
