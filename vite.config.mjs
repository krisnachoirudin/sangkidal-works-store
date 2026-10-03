import { copyFileSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';

export default {
  plugins: [{
    name: 'copy-classic-app-script',
    closeBundle() {
      copyFileSync(resolve('app.js'), resolve('dist/app.js'));
      cpSync(resolve('assets'), resolve('dist/assets'), { recursive: true });
    }
  }]
};