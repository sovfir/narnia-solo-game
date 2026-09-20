/** Экран сохранений: автослот, три ручных слота, экспорт и импорт (§8.6). */

import { useState } from 'preact/hooks';
import type { JSX } from 'preact';

import { useAppSnapshot, useStore } from '../../app/hooks.ts';
import { SLOT_LABELS, type SaveSlot } from '../../app/store.ts';
import { Button } from '../components.tsx';

function formatTime(value: number): string {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function SavesScreen(): JSX.Element {
  const store = useStore();
  const { saves, state } = useAppSnapshot();
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [exportText, setExportText] = useState('');

  const act = (slot: SaveSlot, kind: 'save' | 'load' | 'delete'): void => {
    if (kind === 'save') {
      setMessage(store.saveTo(slot) ? `Партия записана в «${SLOT_LABELS[slot]}»` : 'Не удалось записать');
    } else if (kind === 'load') {
      const ok = store.loadFrom(slot);
      setMessage(ok ? `Загружено из «${SLOT_LABELS[slot]}»` : `Не удалось загрузить «${SLOT_LABELS[slot]}»`);
    } else {
      store.deleteSlot(slot);
      setMessage(`Слот «${SLOT_LABELS[slot]}» очищен`);
    }
  };

  return (
    <main class="screen screen--saves">
      <h2 class="screen__title">Сохранения</h2>
      <p class="hint">
        Игра сохраняется автоматически после каждого хода. Ручные слоты — чтобы вернуться
        к развилке позже.
      </p>

      <ul class="slots">
        {saves.map((info) => (
          <li class="card slot" key={info.slot}>
            <div class="slot__head">
              <b>{info.label}</b>
              <span class="hint">{formatTime(info.savedAt)}</span>
            </div>
            <p class="slot__body">
              {info.broken
                ? 'Сохранение повреждено'
                : info.node
                  ? `${info.heroName} · узел ${info.node}${info.square ? ` · квадрат ${info.square}` : ''} · отметок ${info.marks}` +
                    (info.ending ? ` · финал: ${info.ending}` : '')
                  : 'пусто'}
            </p>
            <div class="slot__actions">
              <Button
                disabled={!state}
                onClick={() => act(info.slot, 'save')}
                title="Записать текущую партию в этот слот"
              >
                Сохранить
              </Button>
              <Button disabled={!info.node || info.broken} onClick={() => act(info.slot, 'load')}>
                Загрузить
              </Button>
              <Button kind="danger" disabled={!info.node} onClick={() => act(info.slot, 'delete')}>
                Удалить
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {message && <p class="hint hint--ok">{message}</p>}

      <div class="card">
        <h3 class="card__title">Экспорт партии</h3>
        <p class="hint">Скопируй текст, чтобы перенести партию на другое устройство.</p>
        <Button
          disabled={!state}
          onClick={() => {
            const text = store.exportCurrent();
            setExportText(text);
            setMessage(text ? 'Партия выгружена в поле ниже' : 'Сначала начни партию');
          }}
        >
          Показать JSON
        </Button>
        {exportText && (
          <textarea class="json" rows={6} readOnly value={exportText} onFocus={(event) => (event.target as HTMLTextAreaElement).select()} />
        )}
      </div>

      <div class="card">
        <h3 class="card__title">Импорт партии</h3>
        <textarea
          class="json"
          rows={6}
          placeholder="Вставь JSON сохранения"
          value={importText}
          onInput={(event) => setImportText((event.target as HTMLTextAreaElement).value)}
        />
        <Button
          kind="primary"
          disabled={!importText.trim()}
          onClick={() => {
            const error = store.importSave(importText);
            setMessage(error ?? 'Партия загружена');
            if (!error) store.go('game');
          }}
        >
          Загрузить из текста
        </Button>
      </div>

      <Button onClick={() => store.go(state ? 'game' : 'menu')}>Назад</Button>
    </main>
  );
}
