# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


```bash
sudo lsof -i:8082
kill -9  [pid]
```

# Git: version control
Alright — here’s a safe, lightweight setup so every time you start a new `feat/...` branch, Git automatically tags your current `main` as a rollback point.

That way, if your Claude Code experiment goes wild, you can jump back to exactly where you started.

---

## 1) One-time script

Create a small script called `newfeat` in your project folder (or somewhere in your `PATH`):

**macOS/Linux (`newfeat` script)**

```bash
#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: newfeat <branch-name>"
  exit 1
fi

BRANCH="feat/$1"
DATE=$(date +%Y-%m-%d_%H%M%S)
TAG="rollback-$BRANCH-$DATE"

# Make sure main is up-to-date
git switch main
git pull origin main

# Tag rollback point
git tag -a "$TAG" -m "Rollback point before starting $BRANCH"
git push origin "$TAG"

# Create and switch to feature branch
git switch -c "$BRANCH"

echo "✅ Created $BRANCH and rollback tag $TAG"
```

## 2) Make it runnable

**macOS/Linux**

```bash
chmod +x newfeat
mv newfeat /usr/local/bin/   # or somewhere in your $PATH
```

---

## 3) Usage

From your repo root:

```bash
newfeat login-form
```

This will:

1. Update `main` from remote.
2. Create an **annotated rollback tag** like:

   ```
   rollback-feat/login-form-2025-08-09_142300
   ```
3. Push that tag to remote.
4. Create and switch to `feat/login-form`.

---

## 4) Rollback later

If you hate the branch’s changes, just:

```bash
git switch main
git reset --hard rollback-feat/login-form-2025-08-09_142300
git push --force origin main   # only if you already pushed the unwanted changes
```

or if `main` never got the changes, just delete the branch:

```bash
git branch -D feat/login-form
git push origin --delete feat/login-form
```

---