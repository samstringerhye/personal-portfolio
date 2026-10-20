// Case studies only: wraps each section, from one heading to the next, in
//   <div class="cs-section"><div class="cs-section-head">…</div><div class="cs-section-body">…</div></div>
// so on desktop the head can stay pinned in the left 4 columns while the section's text and images
// scroll past in the other 8. A section starts at a <ProseGroup> that opens with an h2 or h3, or at a
// <ZigzagSection>. In a section with visuals, the first paragraph joins the heading in the head.
// Full-width blocks (carousels, the outcome bar) sit after body parts, across all 12 columns.
//   <div class="cs-section"><div class="cs-section-pin">head, body</div>carousel, body…</div>

const FULL_WIDTH = new Set(['Carousel', 'Metrics'])

const div = (className, children) => ({
  type: 'mdxJsxFlowElement',
  name: 'div',
  attributes: [{ type: 'mdxJsxAttribute', name: 'class', value: className }],
  children,
})

const isEl = (node, name) => node?.type === 'mdxJsxFlowElement' && node.name === name
const isFullWidth = (node) => node.type === 'mdxJsxFlowElement' && FULL_WIDTH.has(node.name)

const opensWithHeading = (node) => {
  const first = node.children?.[0]
  return first?.type === 'heading' && (first.depth === 2 || first.depth === 3)
}

// The section's head and the blocks that open its body
function start(node) {
  if (isEl(node, 'ProseGroup')) {
    const [heading, ...rest] = node.children
    return { head: [heading], items: rest.length ? [{ ...node, children: rest }] : [], zigzag: false }
  }
  // ZigzagSection: its heading and text become the head, its media the first block of the body
  const prose = node.children.filter((c) => isEl(c, 'ProseGroup'))
  const media = node.children.filter((c) => isEl(c, 'Fragment')).flatMap((c) => c.children)
  return { head: prose, items: media.length ? [div('zigzag-media', media)] : [], zigzag: true }
}

// With visuals beside it, the section's first paragraph reads as the head's lead-in
function liftLead(section) {
  if (section.zigzag) return
  const hasVisual = section.items.some((n) => !isEl(n, 'ProseGroup'))
  const first = section.items[0]
  if (!hasVisual || !isEl(first, 'ProseGroup') || first.children[0]?.type !== 'paragraph') return
  const [lead, ...rest] = first.children
  section.head.push(lead)
  if (rest.length) section.items[0] = { ...first, children: rest }
  else section.items.shift()
}

function build(section) {
  liftLead(section)
  // The head pins only beside its own visuals: head and first body share a wrapper, so a full-width
  // block after them (a carousel) starts below where the pin lets go
  const children = []
  let head = div('cs-section-head prose-group', section.head)
  let body = []
  const flush = () => {
    if (head) {
      children.push(div('cs-section-pin', body.length ? [head, div('cs-section-body', body)] : [head]))
      head = null
    } else if (body.length) children.push(div('cs-section-body', body))
    body = []
  }
  for (const node of section.items) {
    if (isFullWidth(node)) {
      flush()
      children.push(node)
    } else body.push(node)
  }
  flush()
  return div('cs-section', children)
}

export default function remarkCaseStudySections() {
  return (tree, file) => {
    const path = file.path ?? file.history?.[0] ?? ''
    if (!path.includes('/content/work/')) return

    const out = []
    let section = null
    // A heading with nothing under it (an h2 over h3 sections) joins the next section's head
    let carried = []

    const close = () => {
      if (!section) return
      if (section.items.length) out.push(build(section))
      else carried = section.head
      section = null
    }

    for (const node of tree.children) {
      const opens = (isEl(node, 'ProseGroup') && opensWithHeading(node)) || isEl(node, 'ZigzagSection')
      if (opens) {
        close()
        const s = start(node)
        section = { ...s, head: [...carried, ...s.head] }
        carried = []
      } else if (section) {
        section.items.push(node)
      } else {
        out.push(node)
      }
    }
    close()
    if (carried.length) out.push(div('cs-section', [div('cs-section-head prose-group', carried)]))
    tree.children = out
  }
}
