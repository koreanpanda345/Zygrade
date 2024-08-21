export default interface BaseTask {
	name: string;
	disabled?: boolean;
	invoke(...args: any[]): Promise<any>;
}

export default abstract class BaseTask {
	constructor(name: string, disabled: boolean = false) {
		this.name = name;
		this.disabled = disabled;
	}

	public async invoke(...args: any[]): Promise<any> {
		throw 'Not yet implemented';
	}
}