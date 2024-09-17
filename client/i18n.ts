const cookieObj =
  typeof window === 'undefined' ? require('next/headers').cookies : require('universal-cookie');

import en from './public/locales/en.json';
import ae from './public/locales/ae.json';
import ir from './public/locales/ir.json';

// import the specific language
const langObj: any = {
  en,
  ae,
  ir,
};

const getLang = () => {
  let lang = null;
  if (typeof window !== 'undefined') {
    // Client-side: use universal-cookie
    const cookies = new cookieObj();
    lang = cookies.get('i18nextLng');
  } else {
    // Server-side: use Next.js headers
    const cookies = cookieObj();
    lang = cookies.get('i18nextLng')?.value || null;
  }
  return lang;
};

export const getTranslation = () => {
  const lang = getLang();
  const data: any = langObj[lang || 'en'];

  const t = (key: string) => {
    return data[key] ? data[key] : key;
  };

  const initLocale = (themeLocale: string) => {
    const lang = getLang();
    i18n.changeLanguage(lang || themeLocale);
  };

  const i18n = {
    language: lang,
    changeLanguage: (lang: string) => {
      const cookies =
        typeof window === 'undefined'
          ? cookieObj(null, { path: '/' })
          : new cookieObj(null, { path: '/' });
      cookies.set('i18nextLng', lang);
    },
  };

  return { t, i18n, initLocale };
};
