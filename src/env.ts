import fs from 'fs';
import os from 'os';
import path from 'path';

const envFilePath = path.resolve(process.cwd(), '.env');

function readEnvVars() {
  return fs.readFileSync(envFilePath, 'utf-8').split(os.EOL);
}

/**
 * Retrieves the value of the specified key from the environment variables.
 * @param key The key to find in the environment variables.
 * @returns The value corresponding to the specified key, or null if the key is not found.
 */
export function getEnvValue(key: string) {
  const matchedLine = readEnvVars().find((line) => line.split('=')[0] === key);

  return matchedLine !== undefined ? matchedLine : null;
}

/**
 * Sets the value of the specified key in the environment variables file.
 * If the key already exists, its value is updated. If not, a new key-value pair is added.
 * @param key The key to set in the environment variables.
 * @param value The value to set for the specified key.
 */
export function setEnvValue(key: string, value: string) {
  // Read existing environment variables from file
  const envVars = readEnvVars();

  // Find the line corresponding to the target key
  const targetLine = envVars.find((line) => line.split('=')[0] === key);

  // If the key exists, update its value; otherwise, add a new key-value pair
  if (targetLine !== undefined) {
    const targetLineIndex = envVars.indexOf(targetLine);
    envVars.splice(targetLineIndex, 1, `${key}="${value}"`);
  } else {
    envVars.push(`${key}="${value}"`);
  }

  // Write the updated environment variables back to file
  fs.writeFileSync(envFilePath, envVars.join(os.EOL));
}
