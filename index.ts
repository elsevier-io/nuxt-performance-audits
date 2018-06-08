import { Builder } from 'nuxt';
import BundleSizeAudit, { ISettings as IBundleSizeAuditSettings } from './audits/bundle-size';

export interface ISettings {
    bundleSize: IBundleSizeAuditSettings;
}

interface ICompileResult {
    name: 'client' | 'server';
    /**
     * The webpack documentation and @types package is currently inaccurate to what
     * this actually contains so cast to any for now.
     */
    stats: any;
}

export default class NuxtPerformanceAudits {
    private log: (...logs: string[]) => void;
    private settings: Partial<ISettings>;

    constructor(settings: Partial<ISettings> = {}) {
        this.log = console.log;
        this.settings = settings;
    }

    public run(nuxtInstance: any): void {
        nuxtInstance.hook('build:compiled', this.onCompiled.bind(this));

        new Builder(nuxtInstance)
            .build()
            .then(() => process.exit())
            .catch((err) => {
                throw new Error(err);

                process.exit(1);
            });
    }

    private onCompiled({ name, stats }: ICompileResult): void {
        // Only assess the client build
        if (name === 'client') {
            new BundleSizeAudit(this.log, this.settings.bundleSize, stats.compilation.assets).run();
        }
    }
}
