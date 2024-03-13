export interface IModel {
  zuid: string;
  label: string;
  name: string;
  gqlModelName: string;
  gqlUrl: string;
  gqlGetMethodName: string;
  gqlGetAllMethodName: string;
  fields: {
    [fieldName: string]: string;
  };
}
