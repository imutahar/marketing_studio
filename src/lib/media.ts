// Shared preview clips, keyed by style. Single source of truth so the gallery
// and the نوع الفيديو popup reference the same URLs (no duplication/drift).
export const PREVIEW_VIDEOS = {
  fast: "https://d8j0ntlcm91z4.cloudfront.net/user_34hPp7fXOu4gkTrKKk2ESqFSfG1/hf_20260413_124545_9ae0acdc-4d0e-4c03-a065-b572bf9c66cf.mp4",
  tv: "https://d8j0ntlcm91z4.cloudfront.net/user_3CIjqzTsrKEUr8OzFBaYO4ux3nG/hf_20260413_121933_7dfa9582-a536-4a83-9041-ee5aa102ff8c.mp4",
  unboxing: "https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/hf_20260414_230955_d7382d46-8c96-4e25-8a5f-1785ed64b886.mp4",
  influencer: "https://d8j0ntlcm91z4.cloudfront.net/user_3BtuMjeO56IlCCzTiD419c4NiyM/hf_20260415_011357_9dd4f822-d35c-4a43-9102-61ad0bb14331.mp4",
  explainer: "https://d8j0ntlcm91z4.cloudfront.net/user_3Bu8kApHUBmQcoBNUYoyCcOGJne/hf_20260414_232148_e856f696-c60e-4c40-921e-3fc3ac60224f.mp4",
} as const;
