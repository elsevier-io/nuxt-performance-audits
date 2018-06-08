import test from 'ava';
import BundleSizeAudit from '../audits/bundle-size';

const audit = new BundleSizeAudit(() => {}, { // tslint:disable-line:no-empty
    gzip: false,
    jsAssetSizeLimit: 40000,
    warningThresholdPercentage: 90
}, {});

test('settings overwrite defaults', (t) => {
    t.false(audit.settings.gzip);
    t.is(audit.settings.jsAssetSizeLimit, 40000);
    t.is(audit.settings.warningThresholdPercentage, 90);
});

test('only JS files that have been emitted should be assessed', (t) => {
    const dummyAsset = {
        source: () => '',
        emitted: true,
        chunkNames: [],
        chunks: [],
        name: '',
        size: 0
    };
    const assets = audit.getJSAssetNames({
        'foo.js': {
            ...dummyAsset
        },
        'bar.js': {
            ...dummyAsset,
            emitted: false
        },
        'bar.css': dummyAsset
    });

    t.is(assets.length, 1);
    t.is(assets[0], 'foo.js');
});

test('exceedsMax returns appropriately based on whether the max is exceeded', (t) => {
    t.false(audit.exceedsMax({ assetName: '', size: 30000 }));
    t.true(audit.exceedsMax({ assetName: '', size: 50000 }));
});
