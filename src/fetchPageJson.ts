import { toJSON } from '@zesty-io/webengine-json';

/**
 * fetchPageJson
 * Depends on nextjs runtime env vars
 * @param {*} path
 * @returns
 */
export async function fetchPageJson(path: string) {
  if (!process.env.ZESTY_PRODUCTION_DOMAIN || !process.env.ZESTY_PREVIEW_DOMAIN) {
    throw Error(
      'Connection to Zesty.io Instance is Missing. Run <code>npm run sync</code> to start zesty integration'
    );
  }

  // uses .env and .env local values to determine stage or production
  const domain =
    process.env.PRODUCTION === 'true'
      ? process.env.ZESTY_PRODUCTION_DOMAIN
      : process.env.ZESTY_PREVIEW_DOMAIN;

  const data = await toJSON(domain, path, process.env.ZESTY_PREVIEW_PASSWORD);

  return data;
}
