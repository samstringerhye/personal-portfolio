import type { HeadingTag, TextTag, TypographyRole } from './typography'

export type ContentInset = 'sm' | 'md' | 'lg'

export interface HomeContent {
  hero: {
    headline: string
    headlineTag: HeadingTag
    headlineRole: TypographyRole
    body: string
    bodyHighlights?: string[]
    bodyRole: TypographyRole
  }
  work: {
    headline: string
    headingTag: HeadingTag
    headingRole: TypographyRole
    cardTitleTag: HeadingTag
    cardTitleRole: TypographyRole
    contentInset?: ContentInset
  }
  leadership: {
    headline: string
    headingTag: HeadingTag
    headingRole: TypographyRole
    itemTitleRole: TypographyRole
    itemBodyRole: TypographyRole
    items: { title: string; body: string; link?: { href: string; label: string } }[]
  }
  experience: ExperienceContent
  contact: {
    headline: string
  }
  interests: {
    textRole: TypographyRole
    items: string[]
  }
  offHours: {
    headline: string
    items: OffHoursItem[]
  }
}

/** Done once it has a caption; until then `draft` says what Sam still has to supply */
export interface OffHoursItem {
  label: string
  caption?: string
  image?: string
  imageAlt?: string
  draft?: string
}

export interface ExperienceJob {
  title: string
  company: string
  location: string
  startDate: string | null
  endDate: string | null
  highlights: string[]
}

export interface ExperienceContent {
  headline: string
  headingTag: HeadingTag
  jobTitleTag: HeadingTag
  companyTag: TextTag
  headingRole: TypographyRole
  jobTitleRole: TypographyRole
  companyRole: TypographyRole
  highlightRole: TypographyRole
  contentInset?: ContentInset
  jobs: ExperienceJob[]
}
