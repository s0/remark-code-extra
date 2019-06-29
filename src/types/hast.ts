/**
 * Typescript implementation of the spec here: https://github.com/syntax-tree/hast
 *
 * TODO: Move this to DefinitelyTyped
 */

import * as Unist from 'unist';

export interface Parent extends Unist.Parent {
  children: (Element | Doctype | Comment | Text)[];
}

export interface Literal extends Unist.Literal {
  value: string;
}

export interface Root extends Parent {
  type: 'root';
}

export interface Element extends Parent {
  type: 'element';
  tagName: string;
  properties?: unknown;
  content?: Root;
  children: (Element | Comment | Text)[];
}

export interface Doctype extends Unist.Node {
  type: 'doctype';
  name: string;
  public?: string;
  system?: string;
}

export interface Comment extends Literal {
  type: 'comment';
}

export interface Text extends Literal {
  type: 'text';
}
