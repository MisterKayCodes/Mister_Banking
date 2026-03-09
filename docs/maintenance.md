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

## How to Verify
1. Log in to the portal.
2. Click "Details" on your account.
3. The page should load perfectly without the Nginx intercept.
4. If an error occurs, the "Back" button should return you to the dashboard.
