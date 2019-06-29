import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as remark from 'remark';
import * as html from 'remark-html';

import * as codeExtra from 'remark-code-extra';
import {Options} from 'remark-code-extra/options';
import {promisify} from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const FILES_DIR = path.join(path.dirname(__dirname), 'files');

function test(name: string, options: Options) {
  it(name, async () => {

    const markdownPath = path.join(FILES_DIR, name + '.md');
    const htmlPath = path.join(FILES_DIR, name + '.expected.html');

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
  test('001', {});
});
