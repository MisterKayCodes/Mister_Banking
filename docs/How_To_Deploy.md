# 🧒 The "Explain Like I'm 5" Guide to Deploying Your Bank

Deploying a website is like building a **Hotel**. Your VPS is the **Land**, your Code is the **Building**, and Nginx is the **Receptionist**.

## 1. Prerequisites (Shopping for Tools) 🛒
**Analogy:** This is like going to the hardware store to buy hammers, saws, and drills before you start building.
```bash
sudo apt update
sudo apt install -y nginx python3-venv python3-pip certbot python3-certbot-nginx nodejs npm
```
*   **What happened?** We told the server to check for new tools (`update`) and then install the ones we need to run a hotel.

## 2. Emergency Memory / Swap (The Extra Backpack) 🎒
**Analogy:** Imagine you are carrying heavy bricks. Your pockets can only hold so many. A "Swap" file is like an extra backpack on the floor where you can put bricks when your pockets are full so you don't collapse.
```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
```
*   **Why?** Building the frontend takes a LOT of brainpower (RAM). If the server gets tired, it "Kills" the process. This gives it extra room to breathe.

## 3. Directory & Code (Putting the Building on the Land) 🏗️
**Analogy:** We create a spot on the land (`mkdir`) and then "teleport" the building from GitHub onto that spot (`git clone`).
```bash
sudo mkdir -p /var/www/misterbanking
cd /var/www/misterbanking
git clone https://github.com/MisterKayCodes/Mister_Banking.git .
python3 -m venv venv
```

## 4. Backend Dependencies (Hiring the Staff) 👨‍🍳
**Analogy:** A hotel needs chefs and cleaners. `pip install` hires all the specialized workers your code needs to function.
```bash
./venv/bin/pip install -r requirements.txt gunicorn uvicorn
```

## 5. Frontend Build (Painting the Walls & Lighting) 🎨
**Analogy:** Raw code is like messy blueprints. `npm run build` takes those blueprints and turns them into a beautiful, finished building that people can actually see.
```bash
cd sterling-archer-ui
npm install --legacy-peer-deps
export NODE_OPTIONS="--max-old-space-size=1024"
npm run build
```

## 6. Nginx (The Front Desk Receptionist) 🛎️
**Analogy:** Someone walks up to your hotel and asks "Where is the room?". Nginx is the receptionist who says "The website files are right this way!".
*   **The Fix:** We had to make sure the receptionist knew the files were in the `sterling-archer-ui/dist` room, not just the hallway!

## 7. Systemd (The 24/7 Security Guard) 👮
**Analogy:** If the chef (your code) falls asleep or gets tired, Systemd is the security guard who wakes them back up immediately so the hotel stays open 24/7.
```bash
sudo systemctl enable --now misterbanking
```

## 8. Troubleshooting: Port 5000 (The Reserved Seat) 🪑
**Analogy:** You try to sit in your reserved seat, but someone else is already sitting there. `fuser -k` is like the bouncer telling them to "Get out!" so you can sit down.
```bash
sudo fuser -k 5000/tcp
```

## 9. SSL / HTTPS (The Security Gate & Padlock) 🔒
**Analogy:** This puts a secret code on every letter sent to the hotel so nobody else can read the guests' mail.
```bash
sudo certbot --nginx -d sterlingarchertrust.com
```

## 10. Registration Failure (The Sealed Vault) 🔐
**Analogy:** You try to register, but the concierge says "The vault is closed." This usually means the hotel's guest book (the database) is locked.
```bash
sudo chown -R www-data:www-data /var/www/misterbanking
sudo chmod -R 775 /var/www/misterbanking
```

## 11. Deep Debugging: "Finding the Ghost" 👻
**Analogy:** If the hotel still isn't working, we need to go to the security room and look at the **CCTV Cameras**. In Linux, the "CCTV" is called `journalctl`.

### Step A: Look at the Cameras
```bash
sudo journalctl -u misterbanking -n 50 --no-pager
```
*   **ELI5:** This tells us exactly which chef (Python) tripped over which rug.

### Step B: The X-Ray Check
```bash
ls -R /var/www/misterbanking/app/
```
*   **ELI5:** This lets us see inside every room at once to find what's missing.

### Step C: The Sledgehammer Fix
```bash
sudo chmod -R 777 /var/www/misterbanking/app/data
```
*   **ELI5:** "I don't care about the locks! Open every door in the data room so the chef can write in the guest book!"

## 14. Phase 14: The Dubious Owner (Who Owns the Land?) 🤨
**Analogy:** You are the **Landlord** (root), but you gave the keys to the **Security Guard** (www-data). When you try to come back and move some furniture (git pull), the Furniture Company (Git) says: "Wait, I don't know who owns this place anymore! I'm not moving anything until you sign this paper."

### The Problem:
Because we changed the owner to `www-data`, Git is being extra cautious and won't pull new code until we tell it: "It's okay, I trust this folder."

### The Fix:
```bash
sudo git config --global --add safe.directory /var/www/misterbanking
```
*   **ELI5:** We signed the paper telling Git that we are the boss and the land is safe.

## 15. Phase 15: The Blueprint Fight (Merge Conflict) 📝🥊
**Analogy:** You try to bring in the new blueprints (`git pull`), but the foreman on-site (the VPS) says: "Wait! I already scribbled some notes on the old blueprints! If I take your new ones, my notes will be lost!"

### The Problem:
Since we manually edited files on the VPS to fix things, Git is afraid of overwriting them. We need to tell Git: "Throw away the scribbled notes! The blueprints from the main office (GitHub) are the only ones that matter."

### The Fix:
```bash
git reset --hard origin/main
```
*   **ELI5:** This is like using a giant eraser to wipe the old blueprints clean and copying the new ones exactly.

## 13. Phase 13: The Port 5000 Trap (The Back Door) 🚪🚧
**Analogy:** You are a guest in the hotel. You want a pizza. Instead of calling the **receptionist** (Nginx) on the room phone, you try to climb out the window and walk to the **Kitchen's Back Door** (Port 5000). But the back door is locked and there is a giant fence (Firewall) in the way!

### The Problem:
Your website was trying to talk to `sterlingarchertrust.com:5000`. But the security fence only allows people through the **Front Gate** (Port 80/443).

### The Fix:
We told the website code: "Don't try the back door! Just talk to the receptionist (Nginx), and they will pass the order to the chef."

### How to apply the fix:
Since we changed the "painting" (the frontend code), we have to repaint the hotel.
1.  **On your computer:** `git add .`, `git commit`, `git push`.
2.  **On the VPS:**
```bash
cd /var/www/misterbanking
# FORCIBLY SYNC WITH GITHUB:
git fetch origin
git reset --hard origin/main
# THEN REBUILD:
cd sterling-archer-ui
npm run build
```
*   **ELI5:** We erased the messy notes (`reset`), copied the new blueprints, and then repainted the house (`build`).

## 12. Phase 12: API Roadblocks (The Phone Lines) ☎️
**Analogy:** You are in the hotel room and try to call the kitchen to order food. If the phone lines are crossed or disconnected, the chef never hears you.

### Step A: Check the Phone Lines (Browser Console)
1.  On your computer, open the website.
2.  Press **F12** (or Right-click > Inspect).
3.  Go to the **"Network"** tab.
4.  Try to sign up and look for a red line.
*   **ELI5:** This shows us if the message even left the guest's room.

### Step B: The Proxy Check (Receptionist's Map)
If the guest is calling the wrong number, we need to check the Receptionist's (Nginx) map.
```bash
sudo cat /etc/nginx/sites-available/sterlingarchertrust
```
*   **ELI5:** We need to make sure the receptionist knows that every call for "Food" (API) goes to the "Kitchen" (Port 5000).
