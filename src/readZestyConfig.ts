import { readFile } from 'fs/promises';
import { resolve } from 'path';

export async function readZestyConfig() {
  const file = resolve(process.cwd(), '.zesty/config.json');
  const str = await readFile(file, {
    encoding: 'utf-8',
  });

  return JSON.parse(str);
}
