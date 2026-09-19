#!/usr/bin/env python3
"""
Детерминированный разбор предложений внутри строк (версия 2).

Строка книги часто смешивает прозу и инструкцию:
    «Цепляясь за скалу, ты ищешь... Переходи на 443.»
Поэтому режем строку на предложения и классифицируем КАЖДОЕ предложение.
Текст не переписывается — только разделяется.

Метрика — ПОЛНОТА относительно header-аннотаций:
всё, что обещано в аннотации, должно найтись в тексте.

Результат: game/content/sentence_parse.json
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "game" / "content"
BLOCKS = CONTENT / "blocks.json"
OUT = CONTENT / "sentence_parse.json"

SENT_SPLIT = re.compile(r"(?<=[.!?…])\s+(?=[А-ЯЁA-Z«–—\-])")


def split_sentences(text: str) -> list:
    text = text.strip()
    if not text:
        return []
    return [p.strip() for p in SENT_SPLIT.split(text) if p.strip()]


# ---------------- переходы ----------------
RE_TRANSITION = re.compile(
    r"\b(?:переход\w*|перейд\w*|отправляйся|отправляйтесь|иди|идите|ступай|ступайте|"
    r"спеши|спешите|беги|бегите|обратись|обращайся|обратитесь|смотри|см\.|"
    r"читай|читайте|возвращайся|возвращайтесь|плыви|плывите|направляйся|направляйтесь|"
    r"двигайся|двигайтесь|следуй|следуйте|ныряй|ныряйте|прыгай|прыгайте|\s*)\s+"
    r"(?:же\s+)?(?:на|к|ко)\s+(\d{3})",
    re.IGNORECASE,
)
RE_TEBE = re.compile(r"\bтебе\s+(?:на|к)\s+(\d{3})", re.IGNORECASE)
RE_SMOTRI = re.compile(r"\b(?:смотри|см\.)\s*(\d{3})", re.IGNORECASE)
# «Если ты бежишь, скорее на 329» / «Если нет, на 135» — выбор без глагола
RE_BARE_CHOICE = re.compile(
    r"\b[Ее]сли\s+([^,]{0,60}?)[,\s]+(?:скорее\s+|то\s+)?(?:на|к)\s+(\d{3})",
)
RE_DASH_TARGET = re.compile(r"[–—-]\s*(?:на\s+|к\s+)?(\d{3})\b")
RE_BARE_ON = re.compile(r"\bна\s+(\d{3})\b")
# универсальный дефис-переход: «– на 388», «– 291», «- к 105»
RE_ANY_DASH = re.compile(r"[–—-]\s*(?:на\s+|к\s+)?(\d{3})\b")

# ---------------- проверки / отметки ----------------
RE_CHECK_MARK = re.compile(
    r"проверь\s+(?:ключ\w*|отметк\w*)\s+((?:\d+\s*(?:,|или|и)?\s*)+)", re.IGNORECASE
)
RE_DICE = re.compile(r"[Оо]т\s+(\d{1,2})\s*(?:до|[–—-])\s*(\d{1,2})\b(.*?)(\d{3})", re.DOTALL)
RE_MARK_SET = re.compile(r"[Пп]оставь(?:те)?\s+отметк\w*\s+((?:\d+[\s,и]*)+)")
RE_KEY_SET = re.compile(r"[Оо]тметь(?:те)?\s+(?:ключ\w*|отметк\w*)\s+((?:\d+[\s,и]*)+)")
RE_MARK_CLEAR = re.compile(r"[Сс]отри(?:те)?\s+отметк\w*\s+((?:\d+[\s,и]*)+)")

# ---------------- прочее ----------------
RE_FORWARD = re.compile(
    r"(?:^\s*Вперёд\b)"
    r"|(?:\b(?:ступай|ступайте|иди|идите|шагай|двигайся|отправляйся)\s+вперёд\b)",
    re.IGNORECASE,
)
RE_END_WORD = re.compile(r"\bКОНЕЦ\b")
# финалы без слова КОНЕЦ: «Твоё приключение в Нарнии закончилось»
RE_END_PHRASE = re.compile(
    r"приключени\w*\s+в\s+Нарнии\s+(?:закончил|окончил|завершил)\w*"
    r"|В\s+Нарнию\s+вернуться"
    r"|начни\s+(?:всё\s+)?(?:сначала|все\s+сначала)"
    r"|Открой\s+пролог",
    re.IGNORECASE,
)
# «Ты в квадрате 3В», «Ты попал в квадрат 5Г», «Читай описание клетки 2Г»,
# «Читай описание местности для квадрата 6В», «Прочти описание для квадрата 6Г»
RE_SQUARE = re.compile(
    r"(?:квадрат|клетк)\w*\s+([1-6][АБВГ])"
    r"|(?:описани\w+|местности)\s+(?:для\s+)?([1-6][АБВГ])",
)
RE_RESULT_RANGE = re.compile(
    r"[Ее]сли\s+(?:результат\w*|получил\w*)?\s*(\d{1,2})\s*[-–—]\s*(\d{1,2})\b.*?(\d{3})",
    re.DOTALL,
)
RE_RESULT_BRANCH = re.compile(
    r"[Ее]сли\s+(?:получил(?:ось|ся)|результат\w*|выпал\w*)\s+(\d{1,2})\b"
    r"(?!\s*[-–—]\s*\d).*?(\d{3})",
    re.DOTALL,
)
RE_SKILL_HINT = re.compile(
    r"добавь(?:те)?\s+(?:к\s+полученному\s+результату\s+)?(?:свою|своё|свой|свои)?\s*([А-Яа-яЁё]+)"
)
RE_SKILL_UP = re.compile(r"([А-Яа-яЁё\s]+?)\s+(?:увеличивается|возрастает|повышается)\s+на\s+(\d+)")
RE_SKILL_DOWN = re.compile(r"[Уу]меньши(?:те)?\s+на\s+(\d+)\s+(?:свою\s+|своё\s+|свой\s+)?([А-Яа-яЁё]+)")
RE_DEPRIVE = re.compile(r"[Вв]ычти\s+(\d+)\s+из\s+(?:своей\s+|своего\s+)?([А-Яа-яЁё]+)")
RE_DEPRIVE_UNTIL = re.compile(r"[Вв]ычитай\s+(\d+)\s+из\s+(?:своей\s+)?([А-Яа-яЁё]+)")

SKILL_WORDS = {
    "хватк": "grip", "хватку": "grip", "хватка": "grip",
    "изворотливост": "agility", "изворотливость": "agility",
    "энерги": "energy", "энергию": "energy", "энергия": "energy",
    "красноречи": "oratory", "красноречие": "oratory",
    "проницательност": "insight", "проницательность": "insight",
    "внутреннюю": "inner", "внутренняя": "inner", "внутренней": "inner",
    "силу": "inner", "сила": "inner", "силы": "inner",
}


def skill_code(word: str):
    w = word.lower().strip()
    for key, code in SKILL_WORDS.items():
        if w.startswith(key):
            return code
    return None


def classify(sentence: str) -> list:
    """Классифицирует предложение. Возвращает СПИСОК (их может быть несколько)."""
    s = sentence.strip()
    checks = []
    m = RE_CHECK_MARK.search(s)
    if m:
        checks = [int(x) for x in re.findall(r"\d+", m.group(1))]

    if RE_END_WORD.search(s) or RE_END_PHRASE.search(s):
        return [{"t": "END", "checks": checks}]
    if RE_FORWARD.match(s):
        return [{"t": "FORWARD", "checks": checks}]

    # несколько целей в одной фразе: «Кричишь – 248 или нет – 291?»
    dashes = RE_DASH_TARGET.findall(s)
    if len(dashes) >= 2:
        items = []
        for part in re.split(r"\s+или\s+", s):
            found = RE_DASH_TARGET.search(part)
            if found:
                cond = part[:found.start()].strip(" ,;–—-?")
                items.append({"t": "CHOICE", "target": int(found.group(1)),
                              "cond": cond or None, "checks": checks})
            else:
                for sub in classify(part):
                    if sub["t"] != "NAR":
                        items.append(sub)
        if len(items) >= 2:
            return items

    marks = []
    m = RE_MARK_SET.search(s) or RE_KEY_SET.search(s)
    if m:
        marks = [{"t": "MARK", "mark": int(x)} for x in re.findall(r"\d+", m.group(1))]
    else:
        m = RE_MARK_CLEAR.search(s)
        if m:
            marks = [{"t": "CLEAR_MARK", "mark": int(x)} for x in re.findall(r"\d+", m.group(1))]

    # ветка броска без слова «От»: «Если результат 2-5, иди на 261»
    mrr = RE_RESULT_RANGE.search(s)
    if mrr:
        return [{"t": "CHECK", "from": int(mrr.group(1)), "to": int(mrr.group(2)),
                 "target": int(mrr.group(3)), "skill": None, "checks": checks}]
    # «Если получилось 2 – переходи на 526» — одиночное значение
    mres = RE_RESULT_BRANCH.search(s)
    if mres:
        val = int(mres.group(1))
        return [{"t": "CHECK", "from": val, "to": val, "target": int(mres.group(2)),
                 "skill": None, "checks": checks}]

    dice_matches = list(RE_DICE.finditer(s))
    if dice_matches:
        out = []
        for m in dice_matches:
            lo, hi, mid, target = int(m.group(1)), int(m.group(2)), m.group(3), int(m.group(4))
            skill = None
            for word in re.findall(r"[А-Яа-яЁё]+", mid):
                code = skill_code(word)
                if code:
                    skill = code
            out.append({"t": "CHECK", "from": lo, "to": hi, "target": target,
                        "skill": skill, "checks": checks})
        for mk in marks:
            mk["checks"] = checks
            out.append(mk)
        return out

    sq = RE_SQUARE.search(s)
    if sq:
        out = [{"t": "SQUARE", "square": sq.group(1) or sq.group(2), "checks": checks}]
        for mk in marks:
            mk["checks"] = checks
            out.append(mk)
        return out

    m = RE_SKILL_UP.search(s)
    if m:
        code = skill_code(m.group(1).split()[-1]) if m.group(1).split() else None
        if code:
            return [{"t": "SKILL", "skill": code, "delta": int(m.group(2)), "checks": checks}]
    m = RE_SKILL_DOWN.search(s)
    if m:
        code = skill_code(m.group(2))
        if code:
            return [{"t": "SKILL", "skill": code, "delta": -int(m.group(1)), "checks": checks}]
    m = RE_DEPRIVE.search(s) or RE_DEPRIVE_UNTIL.search(s)
    if m:
        code = skill_code(m.group(2))
        if code:
            return [{"t": "DEPRIVE", "skill": code, "delta": -int(m.group(1)), "checks": checks}]

    # переходы — в последнюю очередь, чтобы не потерять отметку из той же фразы.
    # Собираем цели ИЗ ВСЕХ источников сразу: в одной фразе их может быть две.
    matches = []
    seen = set()
    for rx in (RE_ANY_DASH, RE_TRANSITION, RE_TEBE, RE_SMOTRI):
        for m in rx.finditer(s):
            t = int(m.group(1))
            if t in seen:
                continue
            seen.add(t)
            matches.append((m.start(), t))

    if matches:
        matches.sort()
        # « или » режет условие только если целей в предложении действительно две
        multi = len(matches) > 1
        found = []
        for pos, t in matches:
            cut = re.sub(r"\([^)]*\)", "", s[:pos]).strip()
            if multi and " или " in cut:
                cut = cut.rsplit(" или ", 1)[-1]
            cut = cut.strip(" ,;–—-?")
            if cut.lower().startswith("иначе"):
                cut = "Иначе"
            found.append({"t": "CHOICE", "target": t,
                          "cond": cut or None, "checks": checks})
        for mk in marks:
            mk["checks"] = checks
            found.append(mk)
        return found

    m = RE_BARE_CHOICE.search(s)
    if m:
        cond = "Иначе" if m.group(1).startswith("нет") else ("Если " + m.group(1)).strip(" ,;–—-")
        return [{"t": "CHOICE", "target": int(m.group(2)), "cond": cond, "checks": checks}]

    if marks:
        for mk in marks:
            mk["checks"] = checks
        return marks

    return [{"t": "NAR", "checks": checks}]


def main() -> int:
    blocks = json.loads(BLOCKS.read_text(encoding="utf-8"))
    nodes = [b for b in blocks if b["kind"] == "node"]
    squares_blocks = [b for b in blocks if b["kind"] == "square"]

    report = []
    no_exit, lost_targets, lost_dice = [], {}, {}

    for b in blocks:
        sentences = []
        for line in b["lines"]:
            for s in split_sentences(line["text"]):
                for c in classify(s):
                    c["line_i"] = line["i"]
                    c["text"] = s
                    mchk = RE_CHECK_MARK.search(s)
                    if mchk:
                        c["check_mode"] = "any" if "или" in mchk.group(1).lower() else "all"
                    sentences.append(c)

        # навык часто назван в ДРУГОМ предложении: «Выбери число и добавь свою Энергию:»
        node_skill = None
        for s_ in sentences:
            m = RE_SKILL_HINT.search(s_["text"])
            if m:
                code = skill_code(m.group(1))
                if code:
                    node_skill = code
                    break
        if node_skill:
            for s_ in sentences:
                if s_["t"] == "CHECK" and not s_.get("skill"):
                    s_["skill"] = node_skill

        targets = sorted({c["target"] for c in sentences if c.get("target")})
        dice = sorted({(c["from"], c["to"]) for c in sentences if c["t"] == "CHECK"})
        marks = sorted({c["mark"] for c in sentences if c["t"] == "MARK"})
        clears = sorted({c["mark"] for c in sentences if c["t"] == "CLEAR_MARK"})
        checks = sorted({n for c in sentences for n in c.get("checks", [])})
        forward = any(c["t"] == "FORWARD" for c in sentences)
        squares = sorted({c["square"] for c in sentences if c["t"] == "SQUARE"})
        ending = any(c["t"] == "END" for c in sentences)
        skills = [(c["skill"], c["delta"]) for c in sentences if c["t"] in ("SKILL", "DEPRIVE")]

        h = b["header"] or {}
        h_targets = sorted(h.get("targets", []))
        h_dice = sorted(tuple(r) for r in h.get("dice_ranges", []))

        miss_t = [t for t in h_targets if t not in targets]
        miss_d = [d for d in h_dice if d not in dice]
        if miss_t:
            lost_targets[b["id"]] = miss_t
        if miss_d:
            lost_dice[b["id"]] = miss_d

        has_exit = bool(targets or forward or squares or ending)
        if not has_exit:
            no_exit.append(b["id"])

        report.append({
            "id": b["id"],
            "kind": b["kind"],
            "status": "broken" if not has_exit else ("loss" if (miss_t or miss_d) else "ok"),
            "targets": targets, "h_targets": h_targets,
            "dice": [list(d) for d in dice], "h_dice": [list(d) for d in h_dice],
            "marks": marks, "clears": clears, "checks": checks,
            "forward": forward, "squares": squares, "ending": ending,
            "skills": [list(x) for x in skills],
            "h_map": h.get("map", False),
            "sentences": sentences,
        })

    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")

    total = len(nodes)
    node_rep = [r for r in report if r["kind"] == "node"]
    ok = sum(1 for r in node_rep if r["status"] == "ok")
    loss = sum(1 for r in node_rep if r["status"] == "loss")
    broken = sum(1 for r in node_rep if r["status"] == "broken")

    print(f"Всего узлов:                 {total}")
    print(f"Полностью разобрано:         {ok} ({ok*100//total}%)")
    print(f"Потеряна часть ссылок:       {loss} ({loss*100//total}%)")
    print(f"НЕТ ВЫХОДА (критично):       {broken} ({broken*100//total}%) -> {no_exit}")
    print(f"Узлов с потерянными целями:  {len(lost_targets)}")
    print(f"Узлов с потерянными кубиками:{len(lost_dice)}")
    print(f"Фиалов найдено:              {sum(1 for r in report if r['ending'])}")
    sq_rep = [r for r in report if r["kind"] == "square"]
    sq_bad = [r["id"] for r in sq_rep if r["status"] != "ok"]
    print(f"Квадратов разобрано:         {len(sq_rep)} (проблемных: {len(sq_bad)} -> {sq_bad})")
    print(f"Записано: {OUT}")

    if lost_targets:
        print("\nГде теряются цели:")
        for k, v in sorted(lost_targets.items()):
            print(f"  узел {k}: не найдено {v}")
    if lost_dice:
        print("\nГде теряются кубики:")
        for k, v in sorted(lost_dice.items()):
            print(f"  узел {k}: не найдено {v}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
