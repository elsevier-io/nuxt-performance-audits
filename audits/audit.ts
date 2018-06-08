export default abstract class Audit {
    private logger: (...logs: string[]) => void;
    public abstract run(): void;

    constructor(logger: (...logs: string[]) => void) {
        this.logger = logger;
    }

    public log(...logs: string[]): void {
        this.logger(...logs);
    }
}
