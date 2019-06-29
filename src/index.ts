import {Node} from 'unist';
import {Attacher, Transformer} from 'unified';
import visit = require('unist-util-visit');

import {validateOptions} from './options';

interface MDASTCode extends Node {
  lang?: string;
  meta: null | string;
  value: string;
}

const attacher: Attacher = (options) =>  {
  if (!validateOptions(options))
    throw new Error('Invalid options');

  const transformer: Transformer = async (tree, _file) => {
    visit<MDASTCode>(tree, 'code', _node => {
      // TODO
    });

    return tree;
  };

  return transformer;
};

(attacher as any).validateOptions = validateOptions;

export = attacher;

