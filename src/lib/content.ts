import type { CollectionEntry } from 'astro:content';

const CHINESE_CHARACTERS_PER_MINUTE = 400;
const ENGLISH_WORDS_PER_MINUTE = 220;
const MINIMUM_READING_MINUTES = 1;
const DATE_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Shanghai',
});

export function sortProjects(projects: CollectionEntry<'projects'>[]): CollectionEntry<'projects'>[] {
  return [...projects].sort(
    (left, right) =>
      Number(right.data.featured) - Number(left.data.featured) ||
      left.data.order - right.data.order ||
      left.id.localeCompare(right.id, 'en'),
  );
}

export function getReadingTime(body: string): number {
  const text = body.replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, '');
  const chineseCharacters = text.match(/[\p{Script=Han}]/gu)?.length ?? 0;
  const englishWords = text.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g)?.length ?? 0;
  const minutes = chineseCharacters / CHINESE_CHARACTERS_PER_MINUTE + englishWords / ENGLISH_WORDS_PER_MINUTE;
  return Math.max(MINIMUM_READING_MINUTES, Math.ceil(minutes));
}

export function formatDate(date: Date): string {
  if (Number.isNaN(date.getTime())) throw new RangeError('日期必须为有效的 Date 实例。');
  return DATE_FORMATTER.format(date).replace(/\//g, '.');
}
