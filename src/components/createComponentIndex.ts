import { writeFile } from 'fs/promises';
import { IModel } from '../types/model';

/**
 * Creates an index file in the specified directory with imports for each model and exports all models.
 * @param dir The directory where the index file will be created.
 * @param models An array of model objects.
 * @param isTyped A boolean indicating whether the index file should be TypeScript or JavaScript.
 */
export async function createComponentIndex(dir: string, models: IModel[], isTyped = false) {
  const file = `${dir}/index.${isTyped ? 'ts' : 'js'}`;
  const names = models.map((model) => model.gqlModelName);
  // TODO .push('Footer', 'Header') // should we be including these with the starter

  const content = `// generated by lib/sync.{js/ts}
   // This is a required an autogenerated file from the Zesty.io NextJS integration
   // This file is overwritten everytime the integration script is run
       
   ${names.map((name) => `import ${name} from './${name}';`).join('\n')}
   
   export {
     ${names.join(', ')}
   }`;

  try {
    await writeFile(file, content);
  } catch (err) {
    console.log(err);
    process.exit();
  }
}
