// lib/dictionary.ts (수정 후)

// import 'server-only'; // 이 파일은 서버에서만 사용됨을 명시 -> 이 라인을 삭제하거나 주석 처리합니다.

const dictionaries: { [key: string]: () => Promise<any> } = {
  en: () => import('@/messages/en.json').then((module) => module.default),
  ko: () => import('@/messages/ko.json').then((module) => module.default),
  ja: () => import('@/messages/ja.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  const loader = dictionaries[locale] || dictionaries.ko; // 해당 로케일 없으면 한국어로
  return loader();
};