import * as hast from './types/hast';
import { MDASTCode, MDASTCodeExtra } from './types';

export interface TransformResults {
  /**
   * Elements to add to the top of the HTML for this code block
   */
  headers?: hast.Element[] | Promise<hast.Element[]>;
  /**
   * Elements to add to the bottom of the HTML for this code block
   */
  footers?: hast.Element[] | Promise<hast.Element[]>;
  /**
   * A general function that applies arbitrary changes to the MDAST node
   */
  transform?: (node: MDASTCodeExtra) => void | Promise<void>;
}

export type Options = {
  transform: TransformResults | ((node: MDASTCode) => (undefined | null | TransformResults | Promise<undefined | null | TransformResults>));
};

export function validateOptions(value: any): value is Options {
  return !!value;
}
