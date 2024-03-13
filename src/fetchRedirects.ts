import webengine from '@zesty-io/webengine-json';

/**
 * fetchRedirects
 * transforms webengine data into expected nextjs shape
 * @returns Array
 */
export async function fetchRedirects() {
  // uses .env and .env local values to determine stage or production
  const domain =
    process.env.PRODUCTION === 'true'
      ? process.env.ZESTY_PRODUCTION_DOMAIN
      : process.env.ZESTY_PREVIEW_DOMAIN;

  try {
    const json = await webengine.redirects(domain, process.env.ZESTY_PREVIEW_PASSWORD);
    return json.map((r: any) => {
      return {
        source: r.path,
        destination: r.target,
        permanent: r.code == 301 ? true : false,
      };
    });
  } catch (err) {
    console.log(err);
    return [];
  }
}
