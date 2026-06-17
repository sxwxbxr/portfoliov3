// Feature flags for sections that can be turned off without removing code.
// Flip to `true` to re-enable the public route, navigation entries, sitemap
// inclusion, and the homepage section. The admin pages and database tables
// stay in place either way so saved content survives the toggle.
export const BLOG_ENABLED = false
export const CASE_STUDIES_ENABLED = false

// Master switch for the public AI features (chat widget, contact-form analysis,
// project deep dive, pitch generator, skill explorer). When `false`, the
// widgets don't render and the /api AI routes return 503. The admin AI-model
// configuration page stays available either way.
export const AI_FEATURES_ENABLED = true
