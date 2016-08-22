/**
 * Overrides prosemirror's default markdown parser and serializer
 * with custom deserialize and serialize methods for an image node.
 */

import {
  defaultMarkdownParser,
  defaultMarkdownSerializer
} from 'prosemirror/dist/markdown';

const serializerNodes = Object.assign({}, defaultMarkdownSerializer.nodes, {
  image: (state, node) => {
    const alt = state.esc(node.attrs.alt || '');
    // We need to add the base URL of the user's hosted federalist site to the
    // markdown so it can be interpolated on build
    const src = state.esc(['{{ site.baseurl }}', node.attrs.src].join('/'));
    const title = node.attrs.title;

    state.write(`![${alt}](${src})`);
  }
});

const parserNodes = Object.assign({}, defaultMarkdownParser.nodes, {
  image: {
    node: "image",
    attrs: tok => ({
      // Images are saved with a src pointing to the github repo where they are
      // first uploaded, but we need to point to the CDN they are served from.
      // So, we remove the github URL and keep only the name of the file and
      // path to their location on amazon
      src: tok.attrGet("src")
        .replace('https://raw.githubusercontent.com/', '')
        .split('/').slice(-2).join('/'),
      title: tok.attrGet("title") || null,
      alt: tok.children[0] && tok.children[0].content || null
    })}
});

defaultMarkdownParser.nodes = parserNodes;
defaultMarkdownSerializer.nodes = serializerNodes;

const markdownParser = defaultMarkdownParser;
const markdownSerializer = defaultMarkdownSerializer;

export {
  markdownParser,
  markdownSerializer
};
