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