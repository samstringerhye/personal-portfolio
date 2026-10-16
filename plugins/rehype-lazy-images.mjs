import { visit } from 'unist-util-visit'

export default function rehypeLazyImages() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        node.properties.loading = 'lazy'
        node.properties.decoding = 'async'
        // Case-study markdown images sit in carousels and device frames about half the page wide;
        // without this they get the constrained layout's "100vw" and download 2-3x too wide
        node.properties.sizes ??= '(max-width: 768px) 100vw, 50vw'
      }
    })
  }
}
