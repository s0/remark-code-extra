# remark-code-extra

[![Build Status](https://dev.azure.com/samlanning/general/_apis/build/status/remark-code-extra?branchName=master)](https://dev.azure.com/samlanning/general/_build/latest?definitionId=7&branchName=master) [![Total alerts](https://img.shields.io/lgtm/alerts/g/samlanning/remark-code-extra.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/samlanning/remark-code-extra/alerts/) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/samlanning/remark-code-extra.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/samlanning/remark-code-extra/context:javascript) [![](https://img.shields.io/npm/v/remark-code-extra.svg)](https://www.npmjs.com/package/remark-code-extra)

Add to or transform the HTML output of markdown code blocks using [remark][].

For example, you can add dedicated links to code snippets that copy the code, or link to a live demo etc...

This plugin is compatible with most [remark][] syntax highlighting plugins,
including [`remark-midas`](https://github.com/remarkjs/remark-midas),
[`remark-tree-sitter`](https://github.com/samlanning/tree-sitter) and
[`remark-highlight.js`](https://github.com/remarkjs/remark-highlight.js).
Just make sure that you use this plugin *after* the highlighting plugins.

## Install

[npm][]:

```sh
npm install remark-code-extra
```

## Use

Say we have the following Markdown file, `example.md`:

```markdown
We'll transform this one:

~~~java https://stackoverflow.com/questions/4042434/converting-arrayliststring-to-string-in-java
List<String> list = ..;
String[] array = list.toArray(new String[0]);
~~~

But leave this the same:

~~~java
List<String> list = ..;
String[] array = list.toArray(new String[0]);
~~~
```

And our script, `example.js`, looks as follows:

```js
const vfile = require('to-vfile')
const report = require('vfile-reporter')
const unified = require('unified')
const markdown = require('remark-parse')
const html = require('remark-html')
const highlight = require('remark-highlight.js')
const codeExtra = require('remark-code-extra');

unified()
  .use(markdown)
  .use(highlight)
  .use(codeExtra, {
    // Add a link to stackoverflow if there is one in the meta
    transform: node => node.meta ? ({
      after: [
        {
          type: 'element',
          tagName: 'a',
          properties: {
            href: node.meta
          },
          children: [{
            type: 'text',
            value: 'View on Stack Overflow'
          }]
        }
      ]
    }) : null
  })
  .use(html)
  .process(vfile.readSync('example.md'), (err, file) => {
    console.error(report(err || file))
    console.log(String(file))
  })
```

Now, running `node example` yields:

```html
<p>We'll transform this one:</p>
<div class="code-extra"><pre><code class="hljs language-java">List&#x3C;String> list = ..;
String[] array = list.toArray(<span class="hljs-keyword">new</span> String[<span class="hljs-number">0</span>]);</code></pre><a href="https://stackoverflow.com/questions/4042434/converting-arrayliststring-to-string-in-java">View on Stack Overflow</a></div>
<p>But leave this the same:</p>
<pre><code class="hljs language-java">List&#x3C;String> list = ..;
String[] array = list.toArray(<span class="hljs-keyword">new</span> String[<span class="hljs-number">0</span>]);</code></pre>

```

Notice how the first codeblock is now wrapped in a `<div>` and has a link to stackoverflow added, whereas the second code block has remained unchanged.

For further examples, please see the [unit tests](tests/src/index.ts).

### Use with [`remark-code-frontmatter`](https://github.com/samlanning/remark-code-frontmatter)

If you want more detailed options than the `meta` [mdast][] node provides, then you can use
[`remark-code-frontmatter`](https://github.com/samlanning/remark-code-frontmatter)
to include frontmatter at the top of your code block and specify detailed options.
The processed frontmatter is then made available to use via the `frontmatter ` field.

You must make sure to use the `remark-code-frontmatter` plugin **before** using `remark-code-extra`.

For example, if you had the following markdown:

````markdown
```
---
before: Some header text
---
Code block with a header
```

```
---
after: Some footer text
---
Code block with a footer
```

```
---
before: Some header text
after: Some footer text
---
Code block with a header and footer
```

```
Code block with no header or footer
```
````

And the following unified processor:

```js
// other imports
const codeFrontmatter = require('remark-code-frontmatter');
const codeExtra = require('remark-code-extra');

const processor = remark()
  .use(codeFrontmatter)
  .use(codeExtra, {
    transform: node => node.frontmatter.before || node.frontmatter.after ? {
      before: node.frontmatter.before && [{
        type: 'text',
        value: node.frontmatter.before
      }],
      after: node.frontmatter.after && [{
        type: 'text',
        value: node.frontmatter.after
      }]
    } : null
  })
  .use(html);
```

Then this would output the following HTML:

```html
<div class="code-extra">Some header text<pre><code>Code block with a header</code></pre></div>
<div class="code-extra"><pre><code>Code block with a footer</code></pre>Some footer text</div>
<div class="code-extra">Some header text<pre><code>Code block with a header and footer</code></pre>Some footer text</div>
<pre><code>Code block with no header or footer
</code></pre>
```

*Note: If you're using `remark-code-frontmatter` alongside a plugin that does code highlighting,
make sure you use the frontmatter plugin **before** the highlighting plugin.*

## API

### `remark().use(codeExtra, options)`

`options` is a required parameter, and you must always specify `transform`.

#### `options.transform`

Either a `TransformResults` object, a function that returns a `TransformResults` object, or a function that returns a promise that eventually resolves to a `TransformResults` object.

If it is object (as opposed to a function),
every code block will always be "transformed".
That is, it will be wrapped in a `<div>`,
and further plugins that interact with MDAST code blocks will not see them.

e.g:

```js
{
  transform: { 
    before: [ /* ... */ ],
    after: [ /* ... */ ]
  }
}
```

If instead it is a function,
then a code block will be "transformed"
only if you return a `TransformResults`.
If you return nothing, or `undefined` or `null` etc... 
then the code block will remain unmodified.

The function is passed the [mdast][] node for the code block as a parameter,
so you can transform the code block based on its markdown information.

**Examples:**

```js
// Always transform
{
  transform: node => ({ /* TransformResults object */ })
}

// Only transform when the node has metadata
{
  transform: node => node.meta ? { /* TransformResults object */ } : null
}

// Asyncronously determine if and how a node should be transformed
{
  transform: async node => ({ /* TransformResults object */ })
}
```

### `TransformResults`

An object that specifies how a code block should be transformed.

#### `TransformResults.before`

(optional) An array of [hast][] elements (or a `Promise` returning such an `Array`) to add to the top of the HTML for this code block.

#### `TransformResults.after`

(optional) An array of [hast][] elements (or a `Promise` returning such an `Array`) to add to the bottom of the HTML for this code block.

#### `TransformResults.transform`

(optional) A function that applies arbitrary changes to the [mdast][] node for this code block (after it has already been changed to a `code-extra` node and prepared as a `<div>`).
If this function has asyncronous operations, then it must return a `Promise`.

**Example:**

```js
unified()
  .use(markdown)
  .use(highlight)
  .use(codeExtra, {
    transform: node => node.meta ? ({
      before: [
        {
          type: 'text',
          value: 'This code block has meta!'
        }
      ],
      after: [
        {
          type: 'text',
          value: node.meta
        }
      ],
      transform: node => {
        // Add a class to it
        node.data.hProperties.className.push('has-meta');
      }
    }) : null
  })
```


## Related

*   [`remark-code-frontmatter`](https://github.com/samlanning/remark-code-frontmatter)
    — Extract frontmatter from markdown code blocks
*   [`remark-rehype`](https://github.com/remarkjs/remark-rehype)
    — Transform Markdown to HTML
*   [`remark-midas`](https://github.com/remarkjs/remark-midas)
    — Highlight CSS code blocks with midas (rehype compatible)
*   [`remark-tree-sitter`](https://github.com/samlanning/remark-tree-sitter)
    — Highlight code with tree-sitter (rehype compatible)
*   [`remark-highlight.js`](https://github.com/remarkjs/remark-highlight.js)
    — Highlight code with highlight.js (via lowlight)
*   [`rehype-highlight`](https://github.com/rehypejs/rehype-highlight)
    — [rehype][] plugin to highlight code (via lowlight)
*   [`rehype-prism`](https://github.com/mapbox/rehype-prism)
    — [rehype][] plugin to highlight code (via refractor)
*   [`rehype-shiki`](https://github.com/rsclarke/rehype-shiki)
    — [rehype][] plugin to highlight code with shiki

<!-- Definitions -->

[hast]: https://github.com/syntax-tree/hast

[mdast]: https://github.com/syntax-tree/mdast

[npm]: https://docs.npmjs.com/cli/install

[remark]: https://github.com/remarkjs/remark

[rehype]: https://github.com/rehypejs/rehype