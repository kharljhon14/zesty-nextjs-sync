import fetch from 'node-fetch';

/**
 * Updates a setting for a Zesty.io instance.
 * @param token The authentication token for the Zesty.io instance.
 * @param instanceZUID The ZUID of the Zesty.io instance.
 * @param setting The setting object to be updated.
 * @returns A promise that resolves to the updated setting object.
 */
export async function putSetting(token: string, instanceZUID: string, setting: any) {
  // Check if the `setting` parameter is provided
  if (!setting) {
    throw Error('`putSetting` function called without required `setting` parameter');
  }

  // Make a PUT request to update the setting
  return fetch(`https://${instanceZUID}.api.zesty.io/v1/env/settings/${setting.ZUID}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(setting), // Convert the setting object to JSON string
  })
    .then((res) => res.json()) // Parse the response JSON
    .catch((err) => {
      console.error(err); // Log any errors that occur during the fetch
      throw err; // Throw the error to handle it outside this function
    });
}
