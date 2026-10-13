export const TYPOGRAPHY_ROLES = [
  'display-lg',
  'display-md',
  'headline-lg',
  'headline-sm',
  'title-lg',
  'body-lg',
  'body-sm',
  'ui',
  'ui-caps',
] as const

export type TypographyRole = (typeof TYPOGRAPHY_ROLES)[number]

export const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
export type HeadingTag = (typeof HEADING_TAGS)[number]

export const TEXT_TAGS = ['p', 'span', 'div'] as const
export type TextTag = (typeof TEXT_TAGS)[number]
