# Study Journal: Refactoring & fixes

## Date: 2026-03-08
**Git Commit Message:** `Feat: add QR code generation and scanning to crypto modals EFP`

### Crypto QR Code Flow (EFP)

#### 1. EXPLAIN (What caused the confusion/bug)
Currently, crypto addresses are 26-42 character alphanumeric strings (e.g., `bc1q...` or `0x...`). Forcing users to manually type or copy/paste these strings is highly error-prone and leads to permanent loss of funds if a single character is wrong. QR codes eliminate this human-error vector entirely by translating the string into a machine-readable optical format.

#### 2. FIX (The Immediate Action)
I needed to add the capability to render QR codes and read them. I added two lightweight, production-grade NPM packages in the `sterling-archer-ui` directory: `qrcode.react` to generate the QR Code on the receiver's screen, and `html5-qrcode` to access the device's camera and scan QR codes on the sender's screen.

#### 3. PRODUCTION (The Ultimate Dev Solution)
I implemented this feature across two modals:
**A. The CryptoReceiveModal.jsx (The Generator)**
Instead of just showing the `btc_address` or `usdt_address` as text, we inject a beautifully styled `<QRCodeSVG />` component in the center of the modal. When the user switches between BTC and USDT, the QR code instantly regenerates to reflect the correct address.

**B. The SendCryptoModal.jsx (The Scanner)**
We added a `Scan QR` button inside the "Recipient Address" input field. When clicked, it opens a camera viewport overlay using `html5-qrcode`. Once the camera detects a valid QR code, it automatically closes the camera, extracts the crypto address string, and instantly populates the input field with zero typos.

## Date: 2026-03-08
**Git Commit Message:** `Feat: add real-time recipient name resolution EFP to internal transfers`

### Account Number Generation & Recipient Resolution (EFP)

#### 1. EXPLAIN (What caused the confusion/bug)
Account numbers in this system are generated using total randomization (e.g., `1748526700`), rather than serial counting (e.g., `100000003`). Why? If accounts were serial, a hacker could guess everyone's account number just by counting up. Randomization creates 9 billion combinations, making it impossible to guess a valid vault door. 
Because it's random, users have no idea if they typed the right 10-digits during a transfer unless the system tells them who the account belongs to. This feature was missing.

#### 2. FIX (The Immediate Action)
I created a highly secure, restricted "Micro-Service" in the backend. 
When given a 10-digit number, this service (`GET /accounts/resolve/{account_number}`) is programmed to return **only two things**: the account number and the owner's Full Name. It explicitly strips out balances and crypto IDs to protect user privacy.

#### 3. PRODUCTION (The Ultimate Dev Solution)
In `TransferModal.jsx`, I added a `useEffect` hook (a reactive listener). 
Now, the precise millisecond you type the 10th digit into the "Recipient Account" box, the frontend silently asks the backend: *"Who owns this?"*. 
The UI then renders a beautiful "Identity Confirmed" block showing the Full Name, positioned right above the PIN input. If you type a fake number, it glows red and says "Verification Failed", physically stopping the user from sending money to the void.
## Date: 2026-03-07
**Git Commit Message:** `Refactor: move get_user_by_id to user_service, fix admin route circular imports`

### The "Circular Import" Problem (Explained Like You're 5)

Imagine you are trying to build a Lego house. 

**File A (Admin Service)** is the builder.
**File B (User Service)** is the instruction manual.

The builder (File A) says: "I need to open the manual (File B) to find out how to build the roof."
But inside the manual (File B), the first page says: "Before you read this, ask the builder (File A) for a pen."

They are stuck! The builder can't build the roof because he can't read the manual. The manual can't be read because it's waiting for the builder to hand over a pen. They just stand there staring at each other forever. This "staring forever" is what Python calls an `ImportError: cannot import name`.

**How we fixed it:**
We changed the rules. We moved the "pen" to a completely different table (a separate place inside `user_service.py`). 
Now, the manual (File B) doesn't need to look at the builder (File A) at all. It just works. And the builder (File A) can open the manual (File B) safely. 

*Rule of thumb: Never let two files point at each other at the top of the page.*
