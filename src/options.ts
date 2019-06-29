export type Options = {
  // TODO
};

export function validateOptions(value: any): value is Options {
  return !!value;
}
