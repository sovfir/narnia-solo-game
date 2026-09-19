#!/usr/bin/env python3
"""
Вливание подписей кнопок в nodes.json + проверка качества.

Проверки:
  - покрытие: каждая кнопка получила подпись
  - нет номеров в подписи («Взять ключ 23» — плохо)
  - нет дублей внутри одного узла (две одинаковые кнопки)
  - длина не больше 6 слов
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "game" / "content"


def main() -> int:
    nodes = json.loads((CONTENT / "nodes.json").read_text(encoding="utf-8"))
    tasks = {}
    for f in sorted((CONTENT / "label_tasks").glob("*.json")):
        tasks.update({(i["id"], i["idx"]): i for i in json.load(open(f, encoding="utf-8"))["items"]})

    labels = {}
    for f in sorted((CONTENT / "labels_out").glob("*_done.json")):
        for l in json.load(open(f, encoding="utf-8"))["labels"]:
            labels[(l["id"], l["idx"])] = l["label"].strip()

    missing = [k for k in tasks if k not in labels]
    problems = {"digits": [], "dup": [], "long": [], "empty": []}

    merged = 0
    for n in nodes:
        seen = {}
        for idx, c in enumerate(n["choices"]):
            if c.get("editorial"):
                continue        # подпись задана в overrides.json, не перезаписываем
            key = (n["id"], idx)
            lab = labels.get(key)
            if not lab:
                continue
            c["label"] = lab
            merged += 1
            if re.search(r"\d", lab):
                problems["digits"].append((n["id"], idx, lab))
            if len(lab.split()) > 6:
                problems["long"].append((n["id"], idx, lab))
            if not lab.strip():
                problems["empty"].append((n["id"], idx, lab))
            if lab in seen:
                problems["dup"].append((n["id"], seen[lab], idx, lab))
            seen[lab] = idx

    (CONTENT / "nodes.json").write_text(
        json.dumps(nodes, ensure_ascii=False, indent=1), encoding="utf-8")

    # ---- квадраты карты ----
    squares = json.loads((CONTENT / "squares.json").read_text(encoding="utf-8"))
    sq_merged = 0
    for sq in squares:
        seen = {}
        for idx, br in enumerate(sq["branches"]):
            if br.get("editorial"):
                continue        # подпись задана в overrides.json, не перезаписываем
            lab = labels.get((sq["id"], idx))
            if not lab:
                continue
            br["label"] = lab
            sq_merged += 1
            if re.search(r"\d", lab):
                problems["digits"].append((sq["id"], idx, lab))
            if len(lab.split()) > 6:
                problems["long"].append((sq["id"], idx, lab))
            if lab in seen:
                problems["dup"].append((sq["id"], seen[lab], idx, lab))
            seen[lab] = idx
    (CONTENT / "squares.json").write_text(
        json.dumps(squares, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"Кнопок всего:        {len(tasks)}")
    print(f"Подписей влито:      {merged} (узлы) + {sq_merged} (квадраты)")
    print(f"Без подписи:         {len(missing)} -> {missing[:10]}")
    print(f"С номерами в тексте: {len(problems['digits'])} -> {problems['digits'][:6]}")
    print(f"Дубли в узле:        {len(problems['dup'])} -> {problems['dup'][:4]}")
    print(f"Слишком длинные:     {len(problems['long'])} -> {problems['long'][:4]}")
    print(f"Пустые:              {len(problems['empty'])}")

    print("\nПримеры узлов с подписями:")
    for nid in (103, 126, 153):
        n = next(x for x in nodes if x["id"] == nid)
        print(f"  узел {nid}: " + " | ".join(f"{c['label']}→{c['target']}" for c in n["choices"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
