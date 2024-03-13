/**
 * Zesty.io NextJS Sync File
 * Connects to your Zesty.io instance and looks for new content models that do not have a
 * view component yet in your project, and will create those component and update the
 * index.js export mapping in `views/zesty/`
 */

import chalk from 'chalk';
import { exit } from 'process';
import { execa } from 'execa';
import Listr from 'listr';
import fetch from 'node-fetch';
import { resolve } from 'path';
import { writeFile } from 'fs/promises';
import SDK from '@zesty-io/sdk';
import { gql } from '@zesty-io/webengine-json';

import { putSetting } from './settings/putSetting.js';
import { readZestyConfig } from './readZestyConfig.js';
import { directory } from './components/directory.js';
import { createFiles } from './components/createFiles.js';
import { setEnvValue } from './env.js';
import { createType } from './components/createType.js';

export async function sync(isTyped = false) {
  const tasks = new Listr([
    {
      title: 'Reading .zesty/config.json',
      task: async (ctx) => {
        /**
         * The sync relies on `zesty init` having been ran already
         * We check for the presence of `.zesty/config.json` to confirm
         */
        try {
          const config = await readZestyConfig();
          ctx.instance = Object.values(config)[0];

          ctx.previewDomain = `https://${ctx.instance.randomHashID}-dev.webengine.zesty.io`;

          if (!ctx.instance.ZUID) {
            if (!ctx.instance.ZUID) {
              console.log(`${chalk.red('Error:')} .zesty/config.json is missing data`);
            }

            console.log(
              `Run the command: ${chalk.bold('zesty init')}, if zesty is not found run ${chalk.bold(
                'npm i -g @zesty-io/cli'
              )} and try again.`
            );
            exit();
          }
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            console.log(`${chalk.red('Error:')} missing .zesty/config.json file`);
            console.log(
              `Run the command: ${chalk.bold('zesty init')}, if zesty is not found run ${chalk.bold(
                'npm i -g @zesty-io/cli'
              )} and try again.`
            );
            exit();
          }
          console.log(error);
          throw error;
        }
      },
    },
    {
      title: 'Configuring instance settings to support nextjs',
      task: async (ctx) => {
        try {
          let { stdout } = await execa('zesty', ['auth:get-user-token']);
          ctx.token = stdout;
        } catch (error) {
          console.log(
            chalk.yellowBright(
              `Auth token not found. Login using the command: ${chalk.bold('zesty auth:login')}`
            )
          );
          exit();
        }

        try {
          ctx.sdk = new SDK(ctx.instance.ZUID, ctx.token);
          const verify = await ctx.sdk.auth.verifyToken(ctx.token);
          if (verify.statusCode !== 200) {
            console.log(
              chalk.yellowBright(
                `Auth token not found. Login using the command: ${chalk.bold('zesty auth:login')}`
              )
            );
            exit();
          }

          // WebEngine needs to be pinged to add latest settings, particularlly mode and password settings
          // note the cache will need to be reset with a put to settings
          // TODO: we should figure out a better solution, this is brittle
          await fetch(ctx.previewDomain);

          const settings = await ctx.sdk.instance.getSettings();

          // Ensure site_protocol is set to https, it defaults to http
          const site_protocol = settings.data.find(
            (setting: any) => setting.key === 'site_protocol'
          );
          if (site_protocol) {
            await putSetting(ctx.token, ctx.instance.ZUID, {
              ...site_protocol,
              value: 'https',
            }).catch(() => {
              throw new Error(`Failed updating instance "site_protocol" settings`);
            });
          }

          // Ensure preview lock is set
          const lock = settings.data.find(
            (setting: any) => setting.key === 'preview_lock_password'
          );
          if (lock) {
            if (lock.value && lock.value !== '') {
              ctx.previewPassword = lock.value;
            } else {
              ctx.previewPassword = Math.random().toString(16).substring(2, 8);
              await putSetting(ctx.token, ctx.instance.ZUID, {
                ...lock,
                value: ctx.previewPassword,
              }).catch(() => {
                throw new Error(`Failed updating instance "preview_lock_password" settings`);
              });
            }
          }

          // Ensure hybrid or headless is active.
          const mode = settings.data.find((setting: any) => setting.key === 'mode');
          if (mode && mode.value === 'traditional') {
            await putSetting(ctx.token, ctx.instance.ZUID, {
              ...mode,
              value: 'hybrid',
            }).catch(() => {
              throw new Error(`Failed updating instance "mode" settings`);
            });
          }

          // Ensure gql is active
          const gql = settings.data.find((setting: any) => setting.key === 'gql');
          if (!gql || gql.value === '0') {
            await putSetting(ctx.token, ctx.instance.ZUID, {
              ...gql,
              value: '1',
            }).catch(() => {
              throw new Error(`Failed updating instance "gql" settings`);
            });
          }

          // TODO check gql cors is set?

          const updatedSettings = await ctx.sdk.instance.getSettings();
          const file = resolve(process.cwd(), '.zesty/settings.json');
          await writeFile(file, JSON.stringify(updatedSettings.data));
        } catch (err) {
          console.error(err);
          throw err;
        }
      },
    },
    {
      title: 'Writing zesty .env variables',
      task: async (ctx) => {
        try {
          setEnvValue('ZESTY_INSTANCE_ZUID', ctx.instance.ZUID);
          setEnvValue('ZESTY_PREVIEW_DOMAIN', ctx.previewDomain);
          setEnvValue('ZESTY_PREVIEW_PASSWORD', ctx.previewPassword);
          setEnvValue('ZESTY_PRODUCTION_DOMAIN', `http://${ctx.instance.domain}`);
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            console.log(`${chalk.red('Error:')} missing .env file`);
            console.log(
              `Please create a .env file at the root of your project, then run the sync again'`
            );
            exit();
          } else {
            console.error(error);
            throw error;
          }
        }
      },
    },
    {
      title: 'Generating component files for zesty models',
      task: async (ctx) => {
        try {
          // Ensure views/zesty directy exists
          const dir = await directory();

          if (isTyped) await createType(dir);

          // Fetch latest models data
          const res = await gql(ctx.previewDomain, ctx.previewPassword);

          // Define file creation steps
          const steps = await createFiles(dir, res.models, ctx.instance.ZUID, isTyped);

          // Run file creation steps
          return new Listr(
            steps.map((step, index) => {
              return {
                title: `Step ${index}`,
                skip: async () => {
                  return await step;
                },
                task: async () => {
                  return await step;
                },
              };
            })
          );

          // return;
        } catch (err) {
          throw err;
        }
      },
    },
    {
      title: 'Done!',
      task: () => {},
    },
  ]);

  tasks.run().catch((err) => {
    // used for debugging
    console.error(err);
    exit();
  });
}
