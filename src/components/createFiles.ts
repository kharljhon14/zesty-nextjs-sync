import { stat } from 'fs/promises';
import { createComponent } from './createComponent.js';
import { createComponentIndex } from './createComponentIndex.js';
import { IModel } from '../types/model.js';

/**
 * Creates component files and an index file in the specified directory based on the provided models.
 * @param dir The directory where the files will be created.
 * @param models An array of model objects.
 * @param instanceZUID The ZUID of the Zesty.io instance.
 * @param isTyped A boolean indicating whether the files should be TypeScript or JavaScript.
 * @returns An array of promises representing the creation steps.
 */
export async function createFiles(
  dir: string,
  models: IModel[],
  instanceZUID: string,
  isTyped = false
) {
  // Array to store promises representing creation steps
  const steps = [];

  // Iterate over each model to generate view files
  for (const model of models) {
    // Check if the model name starts with a numeric character, if yes, prepend 'N' to make it valid
    if (model.gqlModelName.match(/^[0-9]/) !== null) {
      model.gqlModelName = 'N' + model.gqlModelName;
    }

    // Generate the file path for the component file
    const filePath = `${dir}/${model.gqlModelName}.${isTyped ? 'tsx' : 'js'}`;

    try {
      // Check if the file already exists
      await stat(filePath);
      // If the file exists, push a resolved promise indicating it's skipped
      steps.push(Promise.resolve(`Skipped: ${model.label} already exists ${filePath}`));
    } catch (error: any) {
      // If the file doesn't exist
      if (error.code === 'ENOENT') {
        // Create the component file and push a promise representing this step
        const step = createComponent(filePath, model, instanceZUID, isTyped).then(
          () => `Created: ${model.label} to ${filePath}`
        );
        steps.push(step);
      } else {
        // If an error other than 'ENOENT' occurs, throw it
        throw error;
      }
    }
  }

  // Generate the index export file and push a promise representing this step
  steps.push(createComponentIndex(dir, models, isTyped).then(() => `Created index.{js/ts}`));

  // Return the array of promises representing creation steps
  return steps;
}
