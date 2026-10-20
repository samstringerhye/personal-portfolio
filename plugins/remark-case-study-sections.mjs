// Case studies only: wraps each section, from one heading to the next, in
//   <div class="cs-section"><div class="cs-section-head">…</div><div class="cs-section-body">…</div></div>
// so on desktop the head can stay pinned in the left 4 columns while the section's text and images
// scroll past in the other 8. A section starts at a <ProseGroup> that opens with an h2 or h3, or at a
// <ZigzagSection>. Full-width blocks (carousels) sit between body parts, across all 12 columns.

const FULL_WIDTH = new Set(['Carousel'])

const div = (className, children) => ({
  type: 'mdxJsxFlowElement',
  name: 'div',
  attributes: [{ type: 'mdxJsxAttribute', name: 'class', value: className }],
  children,
})

const isEl = (node, name) => node?.type === 'mdxJsxFlowElement' && node.name === name

const opensWithHeading = (node) => {
  const first = node.children?.[0]
  return first?.type === 'heading' && (first.depth === 2 || first.depth === 3)
}

// The section's head and the blocks that open its body
function start(node) {
  if (isEl(node, 'ProseGroup')) {
    const [heading, ...rest] = node.children
    return {
      head: [heading],
      body: rest.length ? [{ ...node, children: rest }] : [],
    }
  }
  // ZigzagSection: its heading and text become the head, its media the first block of the body
  const prose = node.children.filter((c) => isEl(c, 'ProseGroup'))
  const media = node.children
    .filter((c) => isEl(c, 'Fragment'))
    .flatMap((c) => c.children)
  return { head: prose, body: media.length ? [div('zigzag-media', media)] : [] }
}

export default function remarkCaseStudySections() {
  return (tree, file) => {
    const path = file.path ?? file.history?.[0] ?? ''
    if (!path.includes('/content/work/')) return

    const out = []
    let section = null
    let body = null
    // A heading with nothing under it (an h2 over h3 sections) joins the next section's head
    let carried = []

    const closeBody = () => {
      if (body?.length) section.children.push(div('cs-section-body', body))
      body = null
    }
    const closeSection = () => {
      if (!section) return
      closeBody()
      if (section.children.length === 1) carried = section.children[0].children
      else out.push(section)
      section = null
    }

    for (const node of tree.children) {
      const opens = (isEl(node, 'ProseGroup') && opensWithHeading(node)) || isEl(node, 'ZigzagSection')
      if (opens) {
        closeSection()
        const { head, body: first } = start(node)
        section = div('cs-section', [div('cs-section-head prose-group', [...carried, ...head])])
        carried = []
        body = first
      } else if (!section) {
        out.push(node)
      } else if (node.type === 'mdxJsxFlowElement' && FULL_WIDTH.has(node.name)) {
        closeBody()
        section.children.push(node)
      } else {
        body ??= []
        body.push(node)
      }
    }
    closeSection()
    if (carried.length) out.push(div('cs-section', [div('cs-section-head prose-group', carried)]))
    tree.children = out
  }
}
