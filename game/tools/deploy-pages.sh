#!/usr/bin/env bash
# Сборка игры и публикация на GitHub Pages (ветка gh-pages).
#
# Запуск: npm run deploy
# Итог:   https://sovfir.github.io/narnia-solo-game/
#
# Pages раздаёт статику из ветки gh-pages, поэтому в неё кладётся содержимое dist/.
# Actions не используем: у токена gh нет scope workflow, а ветка работает и без него.
set -euo pipefail

GAME_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$GAME_DIR/.." && pwd)"
WORKTREE="$REPO_DIR/.deploy/gh-pages"
REMOTE="${PAGES_REMOTE:-origin}"
BRANCH="${PAGES_BRANCH:-gh-pages}"

echo "▸ сборка"
cd "$GAME_DIR"
npm run build

echo "▸ подготовка ветки $BRANCH"
mkdir -p "$(dirname "$WORKTREE")"
git -C "$REPO_DIR" worktree remove --force "$WORKTREE" 2>/dev/null || true
rm -rf "$WORKTREE"
git -C "$REPO_DIR" worktree add --detach "$WORKTREE" >/dev/null

cd "$WORKTREE"
git checkout --orphan "$BRANCH" >/dev/null 2>&1 || git checkout "$BRANCH"
git rm -rf . >/dev/null 2>&1 || true
find . -mindepth 1 -maxdepth 1 -not -name '.git' -exec rm -rf {} +

cp -R "$GAME_DIR/dist/." .
touch .nojekyll                     # чтобы Pages не прогонял Jekyll

echo "▸ коммит и публикация"
git add -A -f
git -c "user.name=$(git -C "$REPO_DIR" config user.name)" \
    -c "user.email=$(git -C "$REPO_DIR" config user.email)" \
    commit -q -m "Сборка для GitHub Pages: $(date '+%d.%m %H:%M')"
git push -f "$REMOTE" "$BRANCH" 2>&1 | tail -2

cd "$REPO_DIR"
git worktree remove --force "$WORKTREE" 2>/dev/null || true
echo "✓ опубликовано: https://sovfir.github.io/narnia-solo-game/"
