
import {Attacher, Transformer} from 'unified';
import visit = require('unist-util-visit');

import {validateOptions} from './options';
import { MDASTCode, MDASTCodeExtra } from './types';

const attacher: Attacher = (options) =>  {
  if (!validateOptions(options))
    throw new Error('Invalid options');

  const transformer: Transformer = async (tree, _file) => {

    // List of transformations that are ocurring
    let transformations: Promise<void>[] = [];

    visit<MDASTCode>(tree, 'code', node => {
      const transform = typeof options.transform === 'function' ? options.transform(node) : options.transform;
      // Asyncronously apply the transformation
      transformations.push(
        Promise.resolve(transform).then(transform => {
          if (transform) {
            // apply transformation
            const n = node as MDASTCodeExtra;
            n.type = 'code-extra';
          }
        })
      );
    });

    await Promise.all(transformations);
    return tree;
  };

  return transformer;
};

(attacher as any).validateOptions = validateOptions;

export = attacher;

