#!/usr/bin/env python3
"""
Нарезка blocks.json на отдельные файлы-батчи.

Зачем: локальная модель (QWEN 27B) не должна читать весь books-файл (624 КБ),
чтобы обработать свои 15 узлов. Ей нужен только её кусок (~10 КБ).

Результат:
  game/content/batches/batch_100_114.json
  game/content/batches/batch_115_129.json
  ...
  game/content/batches/_index.json   (план батчей)
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "game" / "content"
BLOCKS = CONTENT / "blocks.json"
OUT_DIR = CONTENT / "batches"

BATCH_SIZE = 5


def main() -> int:
    blocks = json.loads(BLOCKS.read_text(encoding="utf-8"))
    nodes = sorted((b for b in blocks if b["kind"] == "node"), key=lambda b: b["id"])
    squares = [b for b in blocks if b["kind"] == "square"]

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    index = []
    for start in range(0, len(nodes), BATCH_SIZE):
        chunk = nodes[start:start + BATCH_SIZE]
        a, b = chunk[0]["id"], chunk[-1]["id"]
        name = f"batch_{a}_{b}.json"
        payload = {
            "kind": "nodes",
            "range": [a, b],
            "blocks": chunk,
        }
        (OUT_DIR / name).write_text(
            json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8"
        )
        index.append({
            "file": name,
            "kind": "nodes",
            "from": a,
            "to": b,
            "count": len(chunk),
            "bytes": (OUT_DIR / name).stat().st_size,
        })

    # квадраты — отдельным файлом целиком (24 блока, они маленькие)
    sq_payload = {"kind": "squares", "range": None, "blocks": squares}
    (OUT_DIR / "squares.json").write_text(
        json.dumps(sq_payload, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    index.append({
        "file": "squares.json",
        "kind": "squares",
        "from": None,
        "to": None,
        "count": len(squares),
        "bytes": (OUT_DIR / "squares.json").stat().st_size,
    })

    (OUT_DIR / "_index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8"
    )

    sizes = [i["bytes"] for i in index if i["kind"] == "nodes"]
    print(f"Батчей узлов:   {len(sizes)}")
    print(f"Размер батча:   {min(sizes)}..{max(sizes)} байт (средний {sum(sizes)//len(sizes)})")
    print(f"Всего узлов:    {sum(i['count'] for i in index if i['kind']=='nodes')}")
    print(f"Квадратов:      {len(squares)} ({index[-1]['bytes']} байт)")
    print(f"Записано в:     {OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
