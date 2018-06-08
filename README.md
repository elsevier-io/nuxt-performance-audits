# Nuxt Performance Audits

Audit the performance of Nuxt projects.

## Usage

Pass a nuxt instance to the NuxtPerformanceAudits class, optionally passing your settings as an argument. Then call `run()`.

```js
import { Nuxt } from 'nuxt';
import * as nuxtConfig from './nuxt.config';
import NuxtPerformanceAudits from '@elsevier/nuxt-performance-audits';

const nuxt = new Nuxt(nuxtConfig);
const mySettings = {};

new NuxtPerformanceAudits(mySettings).run(nuxt);
```

You'll probably want to run the file as an NPM script and pass NODE_ENV=production to ensure that production-built assets are assessed, e.g. (if the file above is called run-performance-audits.js):

```json
// package.json
{
    "scripts": {
        "perf": "NODE_ENV=production node run-performance-audits.js"
    },
}
```

## Audits

### Asset size

Checks the size of assets against a specified limit.

#### Settings

- **gzip** (default: true): check estimated file size after gzip
- **jsAssetSizeLimit** (default: 80000): file size limit, in bytes
- **warningThresholdPercentage** (default: 80): percentage at which to warn users that they are nearing the limit
