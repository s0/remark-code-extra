import type { Attacher, Transformer } from 'unified';
import visit = require('unist-util-visit');

import { validateOptions } from './options';
import { MDASTCode, MDASTCodeExtra } from './types';
import { Element, Text } from './types/hast';

const attacher: Attacher = (options) => {
  if (!validateOptions(options)) throw new Error('Invalid options');

  const transformer: Transformer = async (tree, file) => {
    // List of transformations that are ocurring
    let transformations: Promise<void>[] = [];

    visit<MDASTCode>(tree, 'code', (node) => {
      const transform =
        typeof options.transform === 'function'
          ? options.transform(node, file)
          : options.transform;
      // Asyncronously apply the transformation
      transformations.push(
        Promise.resolve(transform).then(async (transform) => {
          if (transform) {
            // get code child html
            const codeChildren: (Element | Text)[] = (node.data &&
              (node.data.hChildren as (Element | Text)[])) || [
              {
                type: 'text',
                value: node.value,
              },
            ];
            const codeProperties: any =
              (node.data && node.data.hProperties) ||
              (node.lang
                ? {
                    className: ['language-' + node.lang],
                  }
                : {});
            // apply transformation
            const n = node as MDASTCodeExtra;
            n.type = 'code-extra';
            if (!n.data) n.data = {};
            const before = transform.before
              ? await Promise.resolve(transform.before)
              : [];
            const after = transform.after
              ? await Promise.resolve(transform.after)
              : [];
            const children: Element[] = [
              ...before,
              {
                type: 'element',
                tagName: 'pre',
                children: [
                  {
                    type: 'element',
                    tagName: 'code',
                    properties: codeProperties,
                    children: codeChildren,
                  },
                ],
              },
              ...after,
            ];
            n.data.hName = 'div';
            n.data.hProperties = {
              className: ['code-extra'],
            };
            n.data.hChildren = children;
            if (transform.transform) {
              return transform.transform(n, file);
            }
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
