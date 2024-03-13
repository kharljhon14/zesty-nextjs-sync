#! /usr/bin/env node
import { sync } from './sync.js';
import { fetchPageJson } from './fetchPageJson.js';
import { fetchRedirects } from './fetchRedirects.js';

import { Command } from 'commander';

const program = new Command();

program
  .version('1.0.0')
  .description('Cli for for syncing zesty views for next js')
  .option('-ts, --typescript', 'Create files in typescript')
  .parse(process.argv);

const options = program.opts();

if (options.typescript) {
  sync(true);
} else {
  sync();
}

export { fetchRedirects, fetchPageJson };
