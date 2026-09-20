#!/usr/bin/env python3
"""
Сборка финального контента из детерминированного разбора.

Вход:  sentence_parse.json (разбор по предложениям, 100% покрытие)
       blocks.json         (исходный текст и номера строк)
Выход: nodes.json          — структура узлов для движка
       squares.json        — 24 квадрата карты
       label_tasks/*.json   — задания для QWEN: придумать подписи кнопок
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "game" / "content"

LABELS_PER_TASK = 25


def join_sentences(sentences: list) -> str:
    """Склеивает предложения обратно в текст, сохраняя слова автора."""
    out = []
    for s in sentences:
        t = s.strip()
        if not t:
            continue
        if out and not out[-1].endswith(("«", "(", ",")):
            out.append(" ")
        out.append(t)
    return "".join(out)


def build_node(rep: dict) -> dict:
    sentences = rep["sentences"]

    narrative = join_sentences([s["text"] for s in sentences if s["t"] == "NAR"])

    # эффекты: часть относится к узлу целиком («Поставь отметку 6» на входе),
    # часть — к конкретной кнопке («Если ты возьмёшь ключ Розы, поставь отметку 23»).
    def effect_of(s: dict):
        if s["t"] == "MARK":
            return {"type": "set-mark", "id": s["mark"]}
        if s["t"] == "CLEAR_MARK":
            return {"type": "clear-mark", "id": s["mark"]}
        if s["t"] == "SKILL":
            return {"type": "skill", "skill": s["skill"], "delta": s["delta"]}
        if s["t"] == "DEPRIVE":
            return {"type": "deprive", "skill": s["skill"], "delta": s["delta"],
                    "source": s["text"]}
        return None

    choice_lines = {s["line_i"] for s in sentences if s["t"] == "CHOICE"}
    effects_by_line: dict[int, list] = {}
    effects = []
    for s in sentences:
        e = effect_of(s)
        if e is None:
            continue
        if s["line_i"] in choice_lines:
            effects_by_line.setdefault(s["line_i"], []).append(e)
        else:
            effects.append(e)          # эффект применяется при входе в узел

    # варианты выбора: цель + условие (если есть) + возможная проверка отметки
    choices = []
    for s in sentences:
        if s["t"] != "CHOICE":
            continue
        choices.append({
            "target": s["target"],
            "condition": s.get("cond"),
            "checks": s.get("checks", []),
            # «проверь ключ 6, 19, 22 или 23» — любой из ключей, а не все
            "mode": s.get("check_mode", "all"),
            "line_i": s["line_i"],
            "source": s["text"],
            "label": None,          # заполнит QWEN
            "effects": effects_by_line.get(s["line_i"], []),
        })

    # проверка кубика: все ветки одного навыка объединяются
    checks = [s for s in sentences if s["t"] == "CHECK"]
    check = None
    if checks:
        skill = next((c["skill"] for c in checks if c.get("skill")), None)
        check = {
            "skill": skill,
            "branches": [
                {"from": c["from"], "to": c["to"], "target": c["target"]}
                for c in sorted(checks, key=lambda x: x["from"])
            ],
            "source": " ".join(c["text"] for c in checks),
        }

    ending = None
    if rep["ending"]:
        ending = {235: "victory", 526: "fall"}.get(rep["id"], "death")

    return {
        "id": rep["id"],
        "kind": "event",
        "narrative": narrative,
        "choices": choices,
        "check": check,
        "effects": effects,
        "forward": rep["forward"],
        "squares": rep["squares"],
        "conditions": rep["checks"],
        "ending": ending,
    }


def build_square(rep: dict) -> dict:
    """Квадрат карты: текст + ветки с условиями (проверка отметок)."""
    sentences = rep["sentences"]
    narrative = join_sentences([s["text"] for s in sentences if s["t"] == "NAR"])

    branches = []
    for s in sentences:
        if s["t"] != "CHOICE":
            continue
        branches.append({
            "target": s["target"],
            "condition": s.get("cond"),
            "checks": s.get("checks", []),
            "mode": s.get("check_mode", "all"),
            "source": s["text"],
        })

    return {
        "id": rep["id"],
        "kind": "location",
        "narrative": narrative,
        "branches": branches,
        "forward": rep["forward"],
        "squares": rep["squares"],
    }


def main() -> int:
    report = json.loads((CONTENT / "sentence_parse.json").read_text(encoding="utf-8"))
    blocks = json.loads((CONTENT / "blocks.json").read_text(encoding="utf-8"))

    nodes = [build_node(r) for r in report if r["kind"] == "node"]

    # ---- редакторские правки поверх разбора ----
    ov_file = CONTENT / "overrides.json"
    ov = json.loads(ov_file.read_text(encoding="utf-8")) if ov_file.exists() else {}
    by_id = {n["id"]: n for n in nodes}

    for nid, patch in ov.get("check_branches", {}).items():
        n = by_id.get(int(nid))
        if n and n["check"]:
            n["check"]["branches"] = [
                {"from": a, "to": b, "target": t} for a, b, t in patch["branches"]
            ]
            n["check"]["editorial_note"] = patch["reason"]

    def patch_effects(nid, patch: dict) -> None:
        n = by_id.get(int(nid))
        if not n:
            return
        for e in patch.get("remove", []):
            n["effects"] = [x for x in n["effects"] if x != e]
        for e in patch.get("add", []):
            if e not in n["effects"]:
                n["effects"].append(dict(e))
        n.setdefault("editorial_notes", []).append(patch["reason"])

    for nid, patch in ov.get("effects", {}).items():
        patch_effects(nid, patch)
    for nid, patch in ov.get("replace_effects", {}).items():
        patch_effects(nid, patch)

    for nid, items in ov.get("choices", {}).items():
        n = by_id.get(int(nid))
        if not n:
            continue
        for it in items:
            n["choices"].append({
                "target": it["target"],
                "condition": it["condition"],
                "checks": it.get("checks", []),
                "line_i": None,
                "source": f"Редакторская связка (overrides.json, узел {nid})",
                "label": it["label"],
                "editorial": True,
                "editorial_note": it["reason"],
            })

    (CONTENT / "nodes.json").write_text(
        json.dumps(nodes, ensure_ascii=False, indent=1), encoding="utf-8")

    squares = [build_square(r) for r in report if r["kind"] == "square"]
    sq_by_id = {s["id"]: s for s in squares}
    for sid, items in ov.get("square_branches", {}).items():
        s = sq_by_id.get(sid)
        if not s:
            continue
        for it in items:
            branch = {
                "target": it["target"],
                "condition": it["condition"],
                "checks": it.get("checks", []),
                "mode": "all",
                "source": f"Редакторская связка (overrides.json, квадрат {sid})",
                "label": it["label"],
                "editorial": True,
                "editorial_note": it["reason"],
            }
            # условные ветки должны идти раньше безусловного «Иначе», иначе «Иначе»
            # перехватит игрока с нужной отметкой
            pos = next((i for i, b in enumerate(s["branches"]) if not b.get("checks")),
                       len(s["branches"]))
            s["branches"].insert(pos, branch)
    (CONTENT / "squares.json").write_text(
        json.dumps(squares, ensure_ascii=False, indent=1), encoding="utf-8")

    # ---- задания для QWEN: подписи кнопок ----
    tasks_dir = CONTENT / "label_tasks"
    tasks_dir.mkdir(exist_ok=True)
    for old in tasks_dir.glob("*.json"):
        old.unlink()

    def ctx(text: str) -> str:
        return (text[:240] + "…") if len(text) > 240 else text

    items = []
    for n in nodes:
        for idx, c in enumerate(n["choices"]):
            if c.get("label"):      # редакторские связки уже подписаны вручную
                continue
            items.append({
                "id": n["id"],
                "idx": idx,
                "source": c["source"],
                "cond": c["condition"],
                "context": ctx(n["narrative"]),
            })
    for sq in squares:
        for idx, br in enumerate(sq["branches"]):
            if br.get("label"):
                continue
            items.append({
                "id": sq["id"],
                "idx": idx,
                "source": br["source"],
                "cond": br["condition"],
                "context": ctx(sq["narrative"]),
            })

    n_tasks = 0
    for start in range(0, len(items), LABELS_PER_TASK):
        chunk = items[start:start + LABELS_PER_TASK]
        n_tasks += 1
        name = f"labels_{n_tasks:02d}.json"
        (tasks_dir / name).write_text(
            json.dumps({"items": chunk}, ensure_ascii=False, indent=1), encoding="utf-8")

    # ---- статистика ----
    with_choices = sum(1 for n in nodes if n["choices"])
    with_check = sum(1 for n in nodes if n["check"])
    with_effects = sum(1 for n in nodes if n["effects"])
    with_forward = sum(1 for n in nodes if n["forward"])
    endings = [n["id"] for n in nodes if n["ending"]]
    empty_narr = [n["id"] for n in nodes if not n["narrative"]]

    print(f"Узлов собрано:            {len(nodes)}")
    print(f"  с вариантами выбора:    {with_choices}")
    print(f"  с проверкой кубика:     {with_check}")
    print(f"  с эффектами:            {with_effects}")
    print(f"  с «Вперёд»:             {with_forward}")
    print(f"  финалов:                {len(endings)} -> {sorted(endings)}")
    print(f"Квадратов:                {len(squares)}")
    print(f"  с ветками:              {sum(1 for s_ in squares if s_['branches'])}")
    print(f"  только «Вперёд»:        {sum(1 for s_ in squares if s_['forward'] and not s_['branches'])}")
    print(f"  с проверкой отметок:    {sum(1 for s_ in squares if any(b['checks'] for b in s_['branches']))}")
    print(f"Всего кнопок к разметке:  {len(items)} в {n_tasks} заданиях")
    if empty_narr:
        print(f"ВНИМАНИЕ, узлы без текста: {empty_narr}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
