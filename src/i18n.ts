export const supportedLangs = ['en', 'it', 'ar', 'zh'] as const
export type Lang = (typeof supportedLangs)[number]
export const defaultLang: Lang = 'en'

export type TextDirection = 'ltr' | 'rtl'

export type LanguageMeta = {
  code: Lang
  label: string
  nativeLabel: string
  dir: TextDirection
  locale: string
}

export const languageMeta: Record<Lang, LanguageMeta> = {
  en: { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr', locale: 'en-US' },
  it: { code: 'it', label: 'Italian', nativeLabel: 'Italiano', dir: 'ltr', locale: 'it-IT' },
  ar: { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl', locale: 'ar' },
  zh: { code: 'zh', label: 'Chinese', nativeLabel: '中文', dir: 'ltr', locale: 'zh-CN' },
}

export type UiText = {
  navHome: string
  navAbout: string
  navProjects: string
  navArchive: string
  articles: string
  series: string
  tags: string
  morePosts: string
  comments: string
  previous: string
  next: string
  newerPosts: string
  olderPosts: string
  read: string
  continueReading: string
  nextPost: string
  archiveTitle: string
  archiveDescription: string
  openSearch: string
  searchDialogLabel: string
  searchProductionOnly: string
  footerText: string
  languageSwitcherLabel: string
}

export const ui: Record<Lang, UiText> = {
  en: {
    navHome: 'Home',
    navAbout: 'About',
    navProjects: 'Projects',
    navArchive: 'Archive',
    articles: 'Articles',
    series: 'Series',
    tags: 'Tags',
    morePosts: 'More Posts',
    comments: 'Comments',
    previous: 'Previous',
    next: 'Next',
    newerPosts: 'Newer Posts',
    olderPosts: 'Older Posts',
    read: 'Read',
    continueReading: 'Continue',
    nextPost: 'Next',
    archiveTitle: 'Archive',
    archiveDescription: 'All posts in the archive',
    openSearch: 'Open Search',
    searchDialogLabel: 'Search',
    searchProductionOnly:
      'Search is only available in production builds. Try building and previewing the site to test it out locally.',
    footerText: '© 2025 Florian Sabani, from Italy with pizza and love. All rights reserved.',
    languageSwitcherLabel: 'Language',
  },
  it: {
    navHome: 'Home',
    navAbout: 'Chi sono',
    navProjects: 'Progetti',
    navArchive: 'Archivio',
    articles: 'Articoli',
    series: 'Serie',
    tags: 'Tag',
    morePosts: 'Altri post',
    comments: 'Commenti',
    previous: 'Precedente',
    next: 'Successivo',
    newerPosts: 'Post più recenti',
    olderPosts: 'Post meno recenti',
    read: 'Leggi',
    continueReading: 'Continua',
    nextPost: 'Successivo',
    archiveTitle: 'Archivio',
    archiveDescription: 'Tutti i post nell’archivio',
    openSearch: 'Apri ricerca',
    searchDialogLabel: 'Ricerca',
    searchProductionOnly:
      'La ricerca è disponibile solo nelle build di produzione. Crea una build e visualizza l’anteprima del sito per provarla localmente.',
    footerText: '© 2025 Florian Sabani, dall’Italia con pizza e amore. Tutti i diritti riservati.',
    languageSwitcherLabel: 'Lingua',
  },
  ar: {
    navHome: 'الرئيسية',
    navAbout: 'نبذة عني',
    navProjects: 'المشاريع',
    navArchive: 'الأرشيف',
    articles: 'المقالات',
    series: 'السلاسل',
    tags: 'الوسوم',
    morePosts: 'مقالات أخرى',
    comments: 'التعليقات',
    previous: 'السابق',
    next: 'التالي',
    newerPosts: 'مقالات أحدث',
    olderPosts: 'مقالات أقدم',
    read: 'اقرأ',
    continueReading: 'تابع',
    nextPost: 'التالي',
    archiveTitle: 'الأرشيف',
    archiveDescription: 'كل المقالات في الأرشيف',
    openSearch: 'افتح البحث',
    searchDialogLabel: 'بحث',
    searchProductionOnly:
      'البحث متاح فقط في builds الإنتاج. ابن الموقع واعرضه محليا لتجربته.',
    footerText: '© 2025 فلوريان ساباني، من إيطاليا مع البيتزا والحب. جميع الحقوق محفوظة.',
    languageSwitcherLabel: 'اللغة',
  },
  zh: {
    navHome: '首页',
    navAbout: '关于我',
    navProjects: '项目',
    navArchive: '归档',
    articles: '文章',
    series: '系列',
    tags: '标签',
    morePosts: '更多文章',
    comments: '评论',
    previous: '上一页',
    next: '下一页',
    newerPosts: '较新的文章',
    olderPosts: '较早的文章',
    read: '阅读',
    continueReading: '继续',
    nextPost: '下一篇',
    archiveTitle: '归档',
    archiveDescription: '归档中的所有文章',
    openSearch: '打开搜索',
    searchDialogLabel: '搜索',
    searchProductionOnly:
      '搜索仅在生产构建中可用。请构建并预览网站以在本地测试。',
    footerText: '© 2025 Florian Sabani，来自意大利，带着披萨与热爱。保留所有权利。',
    languageSwitcherLabel: '语言',
  },
}

export type LocalizedRoute =
  | { type: 'home' }
  | { type: 'page'; slug: 'about' | 'projects' }
  | { type: 'posts'; page?: number }
  | { type: 'post'; slug: string }
  | { type: 'tag'; slug: string; page?: number }
  | { type: 'series'; slug: string }
  | { type: 'rss' }

export function isLang(value: string): value is Lang {
  return supportedLangs.includes(value as Lang)
}

export function assertLang(value: string): Lang {
  if (!isLang(value)) {
    throw new Error(`Unsupported language: ${value}`)
  }

  return value
}

export function routePath(lang: Lang, route: LocalizedRoute): string {
  const prefix = `/${lang}`

  switch (route.type) {
    case 'home':
      return `${prefix}/`
    case 'page':
      return `${prefix}/${route.slug}`
    case 'posts':
      return route.page && route.page > 1 ? `${prefix}/posts/${route.page}` : `${prefix}/posts`
    case 'post':
      return `${prefix}/posts/${route.slug}`
    case 'tag':
      return route.page && route.page > 1
        ? `${prefix}/tags/${encodeURIComponent(route.slug)}/${route.page}`
        : `${prefix}/tags/${encodeURIComponent(route.slug)}`
    case 'series':
      return `${prefix}/series/${encodeURIComponent(route.slug)}`
    case 'rss':
      return `${prefix}/rss.xml`
  }
}

export function alternateLinks(
  route: LocalizedRoute,
): Array<{ lang: Lang | 'x-default'; href: string }> {
  return [
    ...supportedLangs.map((lang) => ({ lang, href: routePath(lang, route) })),
    { lang: 'x-default' as const, href: routePath(defaultLang, route) },
  ]
}
