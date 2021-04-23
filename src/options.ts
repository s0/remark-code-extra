import type { VFileCompatible } from 'unified';
import * as hast from './types/hast';
import { MDASTCode, MDASTCodeExtra } from './types';

export interface TransformResults {
  /**
   * Elements to add to the top of the HTML for this code block
   */
  before?: hast.Element[] | Promise<hast.Element[]>;
  /**
   * Elements to add to the bottom of the HTML for this code block
   */
  after?: hast.Element[] | Promise<hast.Element[]>;
  /**
   * A general function that applies arbitrary changes to the MDAST node
   */
  transform?: (
    node: MDASTCodeExtra,
    file: VFileCompatible
  ) => void | Promise<void>;
}

export type Options = {
  transform:
    | TransformResults
    | ((
        node: MDASTCode,
        file: VFileCompatible
      ) =>
        | void
        | undefined
        | null
        | TransformResults
        | Promise<void | undefined | null | TransformResults>);
};

export function validateOptions(value: any): value is Options {
  return !!value;
}
