import * as gzipSize from 'gzip-size';
import * as chalk from 'chalk';
import * as prettySize from 'prettysize';
import Audit from './audit';

export interface ISettings {
    gzip: boolean;
    jsAssetSizeLimit: number;
    warningThresholdPercentage: number;
}

interface IAssetSize {
    assetName: string;
    size: number;
}

interface ICompiledWebpackAssets {
    [key: string]: ICompiledWebpackAsset;
}

// https://webpack.js.org/api/stats/#asset-objects
interface ICompiledWebpackAsset {
    source: () => string;
    emitted: boolean;
    chunkNames: string[];
    chunks: number[];
    name: string;
    size: number;
}

export default class BundleSizeAudit extends Audit {
    private compiledAssets: ICompiledWebpackAssets;
    public settings: ISettings;

    constructor(logger: () => void, settings: ISettings, compiledAssets: ICompiledWebpackAssets) {
        super(logger);

        this.compiledAssets = compiledAssets;
        this.settings = { ...{
            // Whether to assess after gzip or not
            gzip: true,
            // Maximum asset size limit, in bytes
            jsAssetSizeLimit: 80000,
            // Percentage at which to warn the user that they're nearing the max
            warningThresholdPercentage: 80
        }, ...settings };
    }

    public run(): void {
        const jsAssetNames = this.getJSAssetNames(this.compiledAssets);
        const sizePromises = jsAssetNames.map((assetName) => this.getSizePromise(assetName, this.compiledAssets[assetName].source()));

        Promise.all(sizePromises).then(this.assessSizes.bind(this));
    }

    public getJSAssetNames(assets: ICompiledWebpackAssets): string[] {
        return Object.keys(assets)
            // Only .js assets
            .filter((assetName) => assetName.match(/\.js$/))
            // That have been emitted
            .filter((assetName) => assets[assetName].emitted);
    }

    private getSizePromise(assetName: string, source: string): Promise<IAssetSize> {
        return new Promise(async (resolve) => {
            const size = this.settings.gzip ? await gzipSize(source) : source.length;

            resolve({ assetName, size });
        });
    }

    public exceedsMax({ assetName, size }: IAssetSize): boolean {
        let exceedsMax = false;
        const sizeStr = prettySize(size, true);
        let msg = '';

        if (size > this.settings.jsAssetSizeLimit) {
            exceedsMax = true;

            msg = (<any>chalk).red(`${(<any>chalk).bold(assetName)} (${sizeStr}) exceeds maximum JS asset size limit`);
        } else if (size > ((this.settings.jsAssetSizeLimit / 100) * this.settings.warningThresholdPercentage)) {
            msg = (<any>chalk).yellow(`${(<any>chalk).bold(assetName)} (${sizeStr}) is close to exceeding the maximum JS asset size limit`);
        } else {
            msg = (<any>chalk).green(`${(<any>chalk).bold(assetName)} (${sizeStr}) looks good`);
        }

        this.log(msg);

        return exceedsMax;
    }

    private assessSizes(sizes: IAssetSize[]): void {
        this.log('');
        this.log((<any>chalk).inverse('Auditing asset size'));
        this.log(`Maximum size${this.settings.gzip ? ' (after gzip)' : ''}: ${(<any>chalk).reset.bold(prettySize(this.settings.jsAssetSizeLimit, true))}`);
        this.log('');

        const allAssetsUnderMax = sizes.filter(this.exceedsMax.bind(this)).length === 0;

        this.log('');

        if (allAssetsUnderMax) {
            this.log((<any>chalk).black.bgGreen('Everything looks good here!'));

            process.exit();
        } else {
            this.log((<any>chalk).white.bgRed('Found one or more assets that exceed maximum limit. Exiting...'));

            process.exit(1);
        }
    }
}
