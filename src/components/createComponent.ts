import { writeFile } from 'fs/promises';
import { IModel } from '../types/model';

/**
 * Creates a component file at the specified path based on the provided model.
 * @param path The path where the component file will be created.
 * @param model The model object used to generate the component.
 * @param instanceZUID The ZUID of the Zesty.io instance.
 * @param isTyped A boolean indicating whether the component file should be TypeScript or JavaScript.
 */
export async function createComponent(
  path: string,
  model: IModel,
  instanceZUID = '',
  isTyped = false
) {
  const dt = new Date().toString();
  const fields = Object.keys(model.fields)
    .map((field) => ` * ${field} (${model.fields[field]})`)
    .join('\n');

  const content = `/**
    * Zesty.io Content Model Component
    * When the ZestyLoader [..slug].js file is used, this component will autoload if it associated with the URL
    *
    * Label: ${model.label}
    * Name: ${model.name}
    * Model ZUID: ${model.zuid}
    * File Created On: ${dt}
    *
    * Model Fields:
    *
    ${fields}
    *
    * In the render function, text fields can be accessed like {content.field_name}, relationships are arrays,
    * images are objects {content.image_name.data[0].url}
    *
    * This file is expected to be customized; because of that, it is not overwritten by the integration script.
    * Model and field changes in Zesty.io will not be reflected in this comment.
    *
    * View and Edit this model's current schema on Zesty.io at https://${instanceZUID}.manager.zesty.io/schema/${model.zuid}
    *
    * Data Output Example: https://zesty.org/services/web-engine/introduction-to-parsley/parsley-index#tojson
    * Images API: https://zesty.org/services/media-storage-micro-dam/on-the-fly-media-optimization-and-dynamic-image-manipulation
    */
   
   import React  from 'react';
   
   function ${model.gqlModelName}({ content }) {
       return (
           <>
               {/* Zesty.io Output Example and accessible JSON object for this component. Delete or comment out when needed.  */}
               <h1 dangerouslySetInnerHTML={{__html:content.meta.web.seo_meta_title}}></h1>
               <div>{content.meta.web.seo_meta_description}</div>
               {/* End of Zesty.io output example */}
           </>
       );
   }
   
   export default ${model.gqlModelName};
   `;

  const contentTypes = `/**
    * Zesty.io Content Model Component
    * When the ZestyLoader [..slug].js file is used, this component will autoload if it associated with the URL
    *
    * Label: ${model.label}
    * Name: ${model.name}
    * Model ZUID: ${model.zuid}
    * File Created On: ${dt}
    *
    * Model Fields:
    *
    ${fields}
    *
    * In the render function, text fields can be accessed like {content.field_name}, relationships are arrays,
    * images are objects {content.image_name.data[0].url}
    *
    * This file is expected to be customized; because of that, it is not overwritten by the integration script.
    * Model and field changes in Zesty.io will not be reflected in this comment.
    *
    * View and Edit this model's current schema on Zesty.io at https://${instanceZUID}.manager.zesty.io/schema/${model.zuid}
    *
    * Data Output Example: https://zesty.org/services/web-engine/introduction-to-parsley/parsley-index#tojson
    * Images API: https://zesty.org/services/media-storage-micro-dam/on-the-fly-media-optimization-and-dynamic-image-manipulation
    */
   
   import React  from 'react';
   import { ContentItem } from './types';
   
   function ${model.gqlModelName}({ content }:{content: ContentItem}) {
       return (
           <>
               {/* Zesty.io Output Example and accessible JSON object for this component. Delete or comment out when needed.  */}
               <h1 dangerouslySetInnerHTML={{__html:content.meta.web.seo_meta_title}}></h1>
               <div>{content.meta.web.seo_meta_description}</div>
               {/* End of Zesty.io output example */}
           </>
       );
   }
   
   export default ${model.gqlModelName};
   `;

  try {
    await writeFile(path, isTyped ? contentTypes : content);
  } catch (err) {
    console.log(err);
    process.exit();
  }
}
