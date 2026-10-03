import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default {
  plugins: [{
    name: 'copy-classic-app-script',
    closeBundle() {
      copyFileSync(resolve('app.js'), resolve('dist/app.js'));
    }
  }]
};