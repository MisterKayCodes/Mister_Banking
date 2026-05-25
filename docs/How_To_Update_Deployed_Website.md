# 🔄 How To Update Your Live Website (After Making Code Changes)

> **Written from experience:** This is exactly what we did on 25 May 2026 to push fixes to `sterlingarchertrust.com`.
> Use this every time you make changes locally and want to see them live.

---

## 🧠 The Big Picture (Analogy)

Think of this like a **Renovation Project**.

- **Your PC** = The Architect's Office (where you draw blueprints)
- **GitHub** = The Filing Cabinet (where blueprints are stored safely)
- **Your VPS (`sterlingarchertrust.com`)** = The Actual Building
- **Nginx** = The Receptionist
- **Systemd** = The 24/7 Security Guard keeping the backend alive

When you change code locally, the building on your VPS doesn't automatically update. You have to:
1. Save new blueprints to GitHub
2. Tell the building to fetch the new blueprints
3. Rebuild the painting (frontend)
4. Hire any new staff (new Python packages)
5. Wake up the guard (restart the backend)

---

## ✅ STEP 1: Push Your Changes to GitHub (On Your PC)

After you've made and tested your code changes locally:

```bash
git add .
git commit -m "your commit message here"
git push origin main
```

> 💡 **From today's session**, our commit was:
> `fix: resolve crypto transfer bugs, BTC decimal precision, and ledger UI`

---

## ✅ STEP 2: SSH Into Your VPS

Open a terminal and connect to your server:

```bash
ssh root@67.211.221.40
```

> 🏠 Your VPS IP is `67.211.221.40`. You will be dropped into the Ubuntu shell.

---

## ✅ STEP 3: Navigate to Your Project Folder

```bash
cd /var/www/misterbanking
```

This is where your live project lives on the server.

---

## ✅ STEP 4: Pull the Latest Code from GitHub

```bash
git fetch origin
git reset --hard origin/main
```

> ⚠️ **Why `reset --hard` and not just `git pull`?**
> Because the VPS sometimes has tiny manual edits or local changes that conflict with GitHub. `reset --hard` wipes those and forces an exact match with GitHub. Your source of truth is always GitHub.

> 🔐 **If Git complains about "dubious ownership"**, run this first:
> ```bash
> sudo git config --global --add safe.directory /var/www/misterbanking
> ```
> Then retry the `git fetch` and `git reset` commands.

---

## ✅ STEP 5: Update Backend Dependencies (If You Added New Libraries)

If you added any new packages to `requirements.txt` (e.g., `faker`, `httpx`, etc.), run:

```bash
source venv/bin/activate
pip install -r requirements.txt
```

> 📦 **From today's session**, we had added `Faker` for automatic transaction generation so we ran this step. If you didn't touch `requirements.txt`, you can skip this.

To check if the backend is healthy after install:
```bash
sudo systemctl status misterbanking
```

---

## ✅ STEP 6: Rebuild the Frontend (ALWAYS Do This for UI Changes)

Any change to the React frontend (`sterling-archer-ui/`) must be **rebuilt**. The VPS serves the compiled `dist/` folder, not the raw source.

```bash
cd /var/www/misterbanking/sterling-archer-ui
npm install --legacy-peer-deps
npm run build
```

> ⚠️ **`--legacy-peer-deps` is important!** Without it, npm may throw peer dependency errors and refuse to install. We hit this during today's session.

> 💾 **If the build runs out of memory** (server RAM is low), set this before building:
> ```bash
> export NODE_OPTIONS="--max-old-space-size=1024"
> npm run build
> ```

> ✅ A successful build outputs a `dist/` folder inside `sterling-archer-ui/`. Nginx serves files from there.

---

## ✅ STEP 7: Restart the Backend Service

After pulling new code and installing packages, always restart the backend:

```bash
sudo systemctl restart misterbanking
```

Then verify it's actually running:

```bash
sudo systemctl status misterbanking
```

You should see `Active: active (running)` in green. If it's red, check the logs (see Troubleshooting below).

---

## ✅ STEP 8: Test the Live Site

Open your browser and go to:

```
https://sterlingarchertrust.com
```

- Test whatever you changed (login, transfers, transaction history, etc.)
- Open **F12 → Network tab** to check for any red API errors

---

## 🧯 Troubleshooting

### ❌ Backend Crashed / Red Status

View the last 50 lines of logs:

```bash
sudo journalctl -u misterbanking -n 50 --no-pager
```

This is your CCTV. It tells you exactly which line in Python crashed and why.

---

### ❌ Frontend Build Failed — Peer Dependency Error

```
npm error peer vite@"^6.0.0 || ^7.0.0" from @vitejs/plugin-basic-ssl
```

Fix:

```bash
npm install --legacy-peer-deps
npm run build
```

---

### ❌ Git Won't Pull — "Dubious Ownership"

```bash
sudo git config --global --add safe.directory /var/www/misterbanking
git fetch origin
git reset --hard origin/main
```

---

### ❌ Git Won't Pull — "Local Changes Would Be Overwritten"

```bash
git reset --hard origin/main
```

This wipes any manual edits on the VPS and syncs to GitHub. That's fine — GitHub is always the source of truth.

---

### ❌ Site Shows Old Content (Cache)

Nginx serves from `dist/`. If you forgot to rebuild the frontend, the old files are still there.

```bash
cd /var/www/misterbanking/sterling-archer-ui
npm run build
```

No need to restart Nginx — it picks up the new `dist/` files automatically.

---

### ❌ Changes to Backend Logic Not Reflected

Always restart the service after pulling new backend code:

```bash
sudo systemctl restart misterbanking
```

---

## 🗂️ Quick Reference: Full Update Sequence

```bash
# 1. On Your PC — Push to GitHub
git add .
git commit -m "your message"
git push origin main

# 2. SSH into VPS
ssh root@67.211.221.40

# 3. Go to project folder
cd /var/www/misterbanking

# 4. Pull latest code
git fetch origin
git reset --hard origin/main

# 5. Update backend dependencies (only if requirements.txt changed)
source venv/bin/activate
pip install -r requirements.txt

# 6. Rebuild frontend (always do this for any UI change)
cd sterling-archer-ui
npm install --legacy-peer-deps
npm run build

# 7. Restart backend
cd /var/www/misterbanking
sudo systemctl restart misterbanking
sudo systemctl status misterbanking
```

---

## 📋 What We Fixed in the 25 May 2026 Session

For reference, here's what triggered this update:

| Fix | Where | What Changed |
|---|---|---|
| BTC amounts showing as `0` | `AccountLedger.jsx` | Used `maximumFractionDigits: 8` for BTC in `toLocaleString()` |
| Outgoing transfers showing green (credit) instead of red (debit) | `AccountLedger.jsx`, `crypto/index.jsx`, `account/index.jsx` | Changed `isDebit` logic to check against an array of identifiers (account number + BTC address + USDT address) |
| New `Faker` library for automatic transaction generation | `requirements.txt` | Added `Faker` — required `pip install -r requirements.txt` on VPS |

---

> 📖 **See also:** [`How_To_Deploy.md`](./How_To_Deploy.md) — the original full deployment guide for when you're setting up from scratch on a brand new VPS.
