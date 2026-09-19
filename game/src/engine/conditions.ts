/**
 * Условия доступности вариантов выбора.
 *
 * В книге ветка помечается как «Если ты уже встречал X (проверь ключ N)».
 * Такие варианты доступны только при наличии всех нужных отметок.
 * Варианты без проверок доступны всегда («Иначе», безусловные переходы).
 */

export interface MarkState {
  marks: readonly number[];
}

/** Все отметки из условия стоят? */
export function hasMarks(marks: readonly number[], required: readonly number[]): boolean {
  return required.every((m) => marks.includes(m));
}

/** Режим проверки: `all` — все отметки, `any` — хотя бы одна. */
export function hasAnyMark(marks: readonly number[], required: readonly number[]): boolean {
  return required.some((m) => marks.includes(m));
}

export function checksPass(
  marks: readonly number[],
  required: readonly number[],
  mode: 'all' | 'any' = 'all',
): boolean {
  if (required.length === 0) return true;
  return mode === 'any' ? hasAnyMark(marks, required) : hasMarks(marks, required);
}

/**
 * Какие варианты выбора сейчас доступны.
 *
 * Правило интерфейса (§10.2): недоступные варианты не показываем вовсе —
 * название кнопки не должно раскрывать скрытое требование.
 */
export function availableChoices<T extends { checks: number[] }>(
  choices: readonly T[],
  marks: readonly number[],
): T[] {
  return choices.filter((c) => checksPass(marks, c.checks));
}
