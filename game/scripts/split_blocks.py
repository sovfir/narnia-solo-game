#!/usr/bin/env python3
"""
Детерминированный разбор texts.md на структурные блоки.

Никакого LLM: только заголовки, номера строк и заголовочные аннотации вида
    (цели: 138, 142 | Ключи: 1)

Результат: game/content/blocks.json

Каждый блок:
{
  "kind": "node" | "square",
  "id": 102 | "3В",
  "line": 392,                  # строка заголовка в texts.md
  "header": "цели: 105, 112 | кубики: 2-6, 7-12",
  "targets": [105, 112],        # из header.цели
  "dice_ranges": [[2,6],[7,12]],
  "checks": [1],                # из header.Ключи
  "marks": [33],                # из header.отметки
  "map": true,                  # из header.карта/Вперёд
  "lines": [{"n": 396, "text": "..."}]
}
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]          # .../Narnia
TEXTS = ROOT / "texts.md"
OUT_DIR = ROOT / "game" / "content"
OUT = OUT_DIR / "blocks.json"

SQUARE_RE = re.compile(r"^## Квадрат ([1-6][АБВГ])\s*$")
NODE_RE = re.compile(r"^## (\d{3})\s*$")
HEAD_RE = re.compile(r"^\((.+)\)\s*$")

RANGE_RE = re.compile(r"(\d+)\s*-\s*(\d+)")
INT_RE = re.compile(r"\d+")


def parse_header(raw: str) -> dict:
    """Разбирает аннотацию '(цели: 138, 142 | Ключи: 1 | карта/Вперёд)'."""
    out = {"targets": [], "dice_ranges": [], "checks": [], "marks": [], "map": False, "raw": raw}
    parts = [p.strip() for p in raw.split("|")]
    for part in parts:
        low = part.lower()
        if low.startswith("цели"):
            out["targets"] = [int(x) for x in INT_RE.findall(part)]
        elif low.startswith("кубики"):
            out["dice_ranges"] = [[int(a), int(b)] for a, b in RANGE_RE.findall(part)]
        elif low.startswith("ключи"):
            out["checks"] = [int(x) for x in INT_RE.findall(part)]
        elif low.startswith("отметки"):
            out["marks"] = [int(x) for x in INT_RE.findall(part)]
        elif "карта" in low or "вперёд" in low:
            out["map"] = True
    return out


def parse(text: str) -> list:
    blocks = []
    cur = None

    def flush():
        nonlocal cur
        if cur is not None:
            blocks.append(cur)
            cur = None

    for i, line in enumerate(text.split("\n"), start=1):
        m_sq, m_nd = SQUARE_RE.match(line), NODE_RE.match(line)
        if m_sq or m_nd:
            flush()
            if m_sq:
                cur = {"kind": "square", "id": m_sq.group(1), "line": i, "lines": []}
            else:
                num = int(m_nd.group(1))
                # события идут 100..554; всё прочее — не узел
                if 100 <= num <= 554:
                    cur = {"kind": "node", "id": num, "line": i, "lines": []}
                else:
                    cur = None
            continue

        if line.startswith("# ") or line.startswith("---") or line.startswith("### "):
            flush()
            continue

        if cur is not None:
            cur["lines"].append({"n": i, "text": line})

    flush()

    for b in blocks:
        ls = b["lines"]
        while ls and not ls[0]["text"].strip():
            ls.pop(0)
        while ls and not ls[-1]["text"].strip():
            ls.pop()

        b["header"] = None
        b["header_line"] = None
        if ls and HEAD_RE.match(ls[0]["text"].strip()):
            raw = ls[0]["text"].strip()[1:-1]
            b["header"] = parse_header(raw)
            b["header_line"] = ls[0]["n"]
            ls = ls[1:]
            while ls and not ls[0]["text"].strip():
                ls.pop(0)

        b["lines"] = ls
        # перенумеруем строки внутри блока 0..n-1 — так удобнее давать модели
        for idx, l in enumerate(ls):
            l["i"] = idx

    return blocks


def main() -> int:
    text = TEXTS.read_text(encoding="utf-8")
    blocks = parse(text)

    nodes = [b for b in blocks if b["kind"] == "node"]
    squares = [b for b in blocks if b["kind"] == "square"]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(blocks, ensure_ascii=False, indent=1), encoding="utf-8")

    ids = sorted(b["id"] for b in nodes)
    missing = [n for n in range(100, 555) if n not in set(ids)]
    dupes = sorted({x for x in ids if ids.count(x) > 1})
    no_header = [b["id"] for b in nodes if b["header"] is None]
    no_exit = [
        b["id"] for b in nodes
        if b["header"] is not None
        and not b["header"]["targets"]
        and not b["header"]["map"]
    ]

    print(f"Узлов:            {len(nodes)} (ожидалось 455)")
    print(f"Квадратов:        {len(squares)} (ожидалось 24)")
    print(f"Диапазон id:      {ids[0]}..{ids[-1]}")
    print(f"Пропущено:        {missing or 'нет'}")
    print(f"Дубликаты:        {dupes or 'нет'}")
    print(f"Без аннотации:    {len(no_header)} -> {no_header[:20]}")
    print(f"Без целей и карты:{len(no_exit)} -> {no_exit}")
    print(f"Записано:         {OUT}")

    total_dice = sum(1 for b in nodes if b["header"] and b["header"]["dice_ranges"])
    total_map = sum(1 for b in nodes if b["header"] and b["header"]["map"])
    print(f"С кубиками:       {total_dice}")
    print(f"С картой:         {total_map}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
