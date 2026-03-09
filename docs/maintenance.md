# Maintenance Log: Institutional Route Correction 🛡️

## Issue: Routing Conflict & Navigation Drift
**Date:** March 9, 2026
**Symptoms:** 
1. Clicking "Details" on Standard Accounts leads to an unexpected error page.
2. The "Back" button on the error page logs the user out.

## The Diagnosis: "The Greedy Receptionist" 🛎️
**Analogy:** Our Nginx "Receptionist" was told to send *any* mail addressed to "Accounts" directly to the "Kitchen" (Backend). However, some "Accounts" mail is actually meant for the "Front Desk" (UI). Because the receptionist was being too greedy, the UI mail never reached the guest.

## The Solution: "Departmental Sub-Addressing" 🏷️
We are adding a specific tag (`/api`) to all Kitchen mail. This way, the Receptionist knows:
- Mail for `/api/accounts` -> Go to Kitchen.
- Mail for `/accounts` -> Go to Front Desk.

## Changes Applied

### 1. Backend Transformation (`app/main.py`)
Modified all router registrations to live under the `/api` prefix. This isolates backend logic from frontend routing.

### 2. Frontend Nerve Center (`axios.js`)
Updated the Base URL to point to the new `/api` endpoint in production.

### 3. Navigation Guard (`ErrorBoundary.jsx`)
Fixed the "Back" button logic. Instead of sending the user to the "Front Gate" (Login), it now returns them safely to the "Living Room" (Dashboard).

### 4. Nginx Receptionist Policy
Updated the Nginx configuration to only proxy requests that start with `/api`.

## 16. Phase 16: The SSL Lockout (Restoring the Front Gate) 🔒🚧
**Analogy:** We were trying to update the blueprints for the Receptionist, but we accidentally swapped the **Security Gate** map with an old one from before the locks were installed. Now, the gate is locked, and nobody can get in!

### The Problem:
`scripts/nginx_misterbanking.conf` is a "generic" map. When we copied it over, it deleted the **SSL Keys** (HTTPS) that Certbot had set up.

### The Fix:
We need to manually put the SSL keys back into the configuration OR tell the Security Guard (Certbot) to redo the locks.

## New Recovery Procedure (Run these to get back online):
1.  **On the VPS:** Run Certbot again to re-lock the gate.
```bash
sudo certbot --nginx -d sterlingarchertrust.com -d www.sterlingarchertrust.com
```
2.  **Verify the Receptionist:**
```bash
sudo nginx -t && sudo systemctl restart nginx
```
