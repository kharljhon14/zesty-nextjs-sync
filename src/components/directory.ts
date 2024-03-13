import { resolve } from 'path';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';

/**
 * Determines and creates the parent directory for storing component files.
 * In Next.js, it must be either the project root or '/src'.
 * The current working directory (cwd) should be the root of the project,
 * as the sync script which executes this function is run from the root.
 * @returns The path to the parent directory.
 */
export async function directory() {
  let dir;

  if (existsSync('src')) {
    dir = resolve('src', 'views/zesty');
  } else {
    dir = resolve('views/zesty');
  }

  await mkdir(dir, { recursive: true });

  return dir;
}
