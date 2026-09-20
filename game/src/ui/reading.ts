/**
 * Порционная подача текста (§S8): длинные сцены книги режутся на страницы,
 * чтобы на телефоне не приходилось читать простыню.
 */

/** Средняя скорость чтения вслух-про-себя для русского текста, символов в минуту. */
const CHARS_PER_MINUTE = 1100;

/** Границы предложений: точка/!/?/… с последующим пробелом. */
const SENTENCE_END = /[.!?…»)]\s+/g;

/**
 * Режет текст на страницы по границам предложений, не превышая `maxChars`.
 * Одно предложение длиннее лимита остаётся целым — рвать его нельзя.
 */
export function splitIntoPages(text: string, maxChars = 700): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed ? [trimmed] : [];

  const sentences: string[] = [];
  let last = 0;
  SENTENCE_END.lastIndex = 0;
  for (let match = SENTENCE_END.exec(trimmed); match !== null; match = SENTENCE_END.exec(trimmed)) {
    const end = match.index + match[0].length;
    sentences.push(trimmed.slice(last, end).trim());
    last = end;
  }
  if (last < trimmed.length) sentences.push(trimmed.slice(last).trim());

  const pages: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && current.length + sentence.length + 1 > maxChars) {
      pages.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) pages.push(current);
  return pages;
}

/** Примерное время чтения в минутах (минимум одна минута для непустого текста). */
export function readingMinutes(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return Math.max(1, Math.round(trimmed.length / CHARS_PER_MINUTE));
}

/** «≈ 2 мин чтения» для длинных сцен, для коротких — пустая строка. */
export function readingLabel(text: string, minMinutes = 2): string {
  const minutes = readingMinutes(text);
  return minutes >= minMinutes ? `≈ ${minutes} мин чтения` : '';
}
