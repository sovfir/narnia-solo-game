#!/usr/bin/env python3
"""
Приёмка контента: проверка целостности графа и структуры.

Это тот слой, который обязан проходить ВСЕГДА — перед каждой сборкой игры.
"""

import json
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "game" / "content"

SQUARES = [f"{c}{r}" for c in range(1, 7) for r in "АБВГ"]
ENTRY = [317, 494]


def main() -> int:
    nodes = {n["id"]: n for n in json.loads((CONTENT / "nodes.json").read_text(encoding="utf-8"))}
    squares = {s["id"]: s for s in json.loads((CONTENT / "squares.json").read_text(encoding="utf-8"))}

    errors, warns = [], []

    # ---- 1. все цели существуют ----
    for nid, n in nodes.items():
        targets = [c["target"] for c in n["choices"]]
        if n["check"]:
            targets += [b["target"] for b in n["check"]["branches"]]
        for t in targets:
            if t not in nodes:
                errors.append(f"узел {nid}: переход на несуществующий {t}")
        for sq in n["squares"]:
            if sq not in SQUARES:
                errors.append(f"узел {nid}: неизвестный квадрат {sq}")
    for sid, s in squares.items():
        for br in s.get("branches", []):
            if br["target"] not in nodes:
                errors.append(f"квадрат {sid}: переход на несуществующий {br['target']}")
        if not s.get("branches") and not s.get("forward"):
            errors.append(f"квадрат {sid}: нет ни веток, ни «Вперёд»")

    # ---- 2. диапазоны кубиков покрывают 2..12 ровно один раз ----
    for nid, n in nodes.items():
        if not n["check"]:
            continue
        br = n["check"]["branches"]
        covered = set()
        hits = {}
        for b in br:
            for value in range(b["from"], b["to"] + 1):
                covered.add(value)
                hits[value] = hits.get(value, 0) + 1
        gap = set(range(2, 13)) - covered
        overlap = sorted(v for v, c in hits.items() if c > 1)
        if gap:
            errors.append(f"узел {nid}: кубик не покрывает {sorted(gap)}")
        if overlap:
            errors.append(f"узел {nid}: диапазоны перекрываются на {overlap}")
        if not n["check"]["skill"]:
            warns.append(f"узел {nid}: не определён навык для проверки")
        if len(br) < 2:
            warns.append(f"узел {nid}: у проверки только одна ветка")

    # ---- 3. выход есть у каждого узла ----
    for nid, n in nodes.items():
        has = n["choices"] or n["check"] or n["forward"] or n["squares"] or n["ending"]
        if not has:
            errors.append(f"узел {nid}: нет выхода и нет финала")

    # ---- 4. достижимость из точек входа ----
    def edges(nid):
        n = nodes[nid]
        out = [c["target"] for c in n["choices"]]
        if n["check"]:
            out += [b["target"] for b in n["check"]["branches"]]
        if n["forward"] or n["squares"]:
            for s in squares.values():
                out += [br["target"] for br in s.get("branches", [])]
        return out

    seen, q = set(), deque(ENTRY)
    while q:
        cur = q.popleft()
        if cur in seen or cur not in nodes:
            continue
        seen.add(cur)
        q.extend(edges(cur))

    unreachable = sorted(set(nodes) - seen)
    if unreachable:
        warns.append(f"недостижимо из {ENTRY}: {len(unreachable)} узлов -> {unreachable[:15]}")

    # ---- 5. финалы ----
    endings = {nid: n["ending"] for nid, n in nodes.items() if n["ending"]}
    if len(endings) != 15:
        errors.append(f"финалов {len(endings)}, ожидалось 15")
    if endings.get(235) != "victory":
        errors.append("узел 235 не помечен как victory")
    if endings.get(526) != "fall":
        errors.append("узел 526 не помечен как fall")

    # ---- 6. отметки: что ставится и что проверяется ----
    def all_effects(n: dict) -> list:
        """Эффекты узла (на входе) + эффекты отдельных кнопок."""
        return list(n["effects"]) + [e for c in n["choices"] for e in c.get("effects", [])]

    set_marks, check_marks = set(), set()
    for n in nodes.values():
        for e in all_effects(n):
            if e["type"] == "set-mark":
                set_marks.add(e["id"])
        check_marks |= set(n["conditions"])
        for c in n["choices"]:
            check_marks |= set(c.get("checks", []))
    for s in squares.values():
        for br in s.get("branches", []):
            check_marks |= set(br.get("checks", []))

    never_checked = sorted(set_marks - check_marks)
    checked_never_set = sorted(check_marks - set_marks)
    if checked_never_set:
        warns.append(f"проверяются, но нигде не ставятся: {checked_never_set}")

    # ---- 7. текст и подписи ----
    empty_nar = [nid for nid, n in nodes.items() if not n["narrative"].strip()]
    no_label = [(nid, i) for nid, n in nodes.items()
                for i, c in enumerate(n["choices"]) if not c.get("label")]
    if empty_nar:
        errors.append(f"узлы без текста: {len(empty_nar)} -> {empty_nar[:10]}")
    if no_label:
        errors.append(f"кнопки без подписи: {len(no_label)} -> {no_label[:10]}")

    # ---- отчёт ----
    print("=" * 60)
    print(f"Узлов:                 {len(nodes)}")
    print(f"Квадратов:             {len(squares)}")
    print(f"Кнопок:                {sum(len(n['choices']) for n in nodes.values())}")
    print(f"Проверок кубика:       {sum(1 for n in nodes.values() if n['check'])}")
    print(f"Финалов:               {len(endings)}")
    print(f"Достижимо из входа:    {len(seen)} из {len(nodes)}")
    print(f"Отметок ставится:      {len(set_marks)}")
    print(f"Отметок проверяется:   {len(check_marks)}")
    sq_br = sum(len(s.get("branches", [])) for s in squares.values())
    print(f"Веток в квадратах:     {sq_br}")
    print(f"Ставятся, но не пров.: {len(never_checked)}")
    print("=" * 60)

    if errors:
        print(f"\n❌ ОШИБКИ ({len(errors)}):")
        for e in errors[:25]:
            print("   " + e)
    else:
        print("\n✅ ОШИБОК НЕТ")

    if warns:
        print(f"\n⚠️  Предупреждения ({len(warns)}):")
        for w in warns[:15]:
            print("   " + w)

    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
