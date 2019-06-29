import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as remark from 'remark';
import * as html from 'remark-html';

import * as codeExtra from 'remark-code-extra';
import { Options } from 'remark-code-extra/options';
import { MDASTCode } from 'remark-code-extra/types';
import {promisify} from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const FILES_DIR = path.join(path.dirname(__dirname), 'files');

function test(name: string, input: string, output: string, options: Options) {
  it(name, async () => {

    const markdownPath = path.join(FILES_DIR, 'input', input + '.md');
    const htmlPath = path.join(FILES_DIR, 'output', output + '.expected.html');

    const processor = remark()
      .use(codeExtra, options)
      .use(html);

    const markdownSource = await readFile(markdownPath, 'utf8');
    const htmlResult = await promisify(processor.process)(markdownSource);

    try {
      const expected = await readFile(htmlPath, 'utf8');
      assert.equal(htmlResult.contents, expected);
    } catch (e) {
      if (process.env.TEST_FIX === 'true') {
        await writeFile(htmlPath, htmlResult.contents);
        throw new Error(`Result Unexpected, written new contents to ${htmlPath}`);
      } else {
        throw e;
      }
    }
  });
}

describe('main tests', () => {
  test('Skip all', 'basic', '001', {
    transform: () => null
  });
  test('Skip all async', 'basic', '001', {
    transform: async () => null
  });
  test('Skip specific language', 'basic', '002', {
    transform: (node: MDASTCode) => node.lang === 'skipped' ? null : {}
  });
  test('Skip specific language async', 'basic', '002', {
    transform: (node: MDASTCode) => node.lang === 'skipped' ? null : {}
  });
  test('No transformation', 'basic', '003', {transform: {
    // No concrete transformation
  }});
});
