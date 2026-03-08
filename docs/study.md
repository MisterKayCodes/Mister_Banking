# Study Journal: Refactoring & fixes

## Date: 2026-03-08
**Git Commit Message:** `Fix: resolve React white screen crash on QR scanner EFP`

### QR Scanner White Screen Crash (EFP)

#### 1. EXPLAIN (What caused the confusion/bug)
When users clicked the "Scan QR" button, the entire application crashed and displayed a white blank page (White Screen of Death). This happened because the `Html5Qrcode` class tried to attach to the `div#qr-reader` element *milliseconds before* React had actually painted it to the DOM. When it couldn't find the element, it threw a synchronous `Error: Element with id 'qr-reader' not found`, which was unhandled by any Error Boundary, causing React to unmount the entire application tree. Furthermore, if a user denied camera permissions, the unhandled Promise rejection also caused instability.

#### 2. FIX (The Immediate Action)
I updated `SendCryptoModal.jsx` to wrap the `Html5Qrcode` initialization logic inside a `setTimeout(..., 100)` to ensure the event loop had finished and the DOM was fully rendered before attaching the scanner. I also wrapped the entire block inside a `try...catch` statement to catch any synchronous initialization errors, and added `.catch()` blocks to the asynchronous camera `.start()` method.

#### 3. PRODUCTION (The Ultimate Dev Solution)
By moving from a primitive synchronous initialization to a heavily defensive, fault-tolerant Ref-based implementation (`useRef(null)` instead of standard state for the scanner instance), we decouple the scanner's heavy lifecycle from React's render cycles. If the camera fails or permissions are denied, it gracefully catches the error, alerts the user ("Failed to access camera"), and immediately disables the scanner overlay, allowing the user to seamlessly fall back to manual text entry without the app exploding. The memory leak is also fixed by calling `.clear()` on dismount.

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

## Date: 2026-03-08
**Git Commit Message:** `Fix: add backdrop click-to-close to CryptoReceiveModal EFP`

### CryptoReceiveModal Close Behavior (EFP)

#### 1. EXPLAIN (What caused the confusion/bug)
Users viewing the 'Inbound Digital Assets' modal (the crypto QR code receiver) felt trapped. While there was a visible 'X' button and a 'Close Vault' button, clicking on the dark, empty background behind the modal did nothing. In modern web design, users expect clicking out of a modal to automatically close it.

#### 2. FIX (The Immediate Action)
I added an `onClick={onClose}` event listener directly to the fixed fullscreen backdrop that dims the background behind the modal.

#### 3. PRODUCTION (The Ultimate Dev Solution)
Because the inner white modal box sits *inside* the darkened backdrop, clicking the white box would also trigger the close event. To prevent this, I attached an `onClick={(e) => e.stopPropagation()}` event listener exclusively to the inner modal wrapper window. This creates the perfect standard UX: clicking the dark void closes the window, clicking the bright modal contents does nothing, letting users safely switch tabs or copy text without accidentally closing it.

## Date: 2026-03-08
**Git Commit Message:** `Fix: scale down CryptoReceiveModal to prevent off-screen clipping EFP`

### CryptoReceiveModal Overflow Layout Fix (EFP)

#### 1. EXPLAIN (What caused the confusion/bug)
The "Inbound Digital Assets" (Crypto Receive) modal had strictly large padding (p-8), oversized components (like a 48x48 layout unit QR box), and a rigid height. On many mobile devices or smaller desktop browser windows, this caused the modal to expand beyond the 100vh height of the viewport. This pushed the "Close" buttons completely off the screen where the user couldn't reach them.

#### 2. FIX (The Immediate Action)
I scaled down all spacing elements inside the modal. Padding was reduced to p-5, the QR code box was shrunk to 32x32 layout units, the text sizes were pulled back mildly, and internal spacing (space-y-6) was replaced with space-y-4 or space-y-3.

#### 3. PRODUCTION (The Ultimate Dev Solution)
To absolutely guarantee the modal can never overflow off the screen again regardless of how small the device is, I added max-h-[90vh] and overflow-y-auto to the main modal container. This explicitly dictates the modal can never exceed 90% of the screen height, and if the contents *still* don't fit, the modal itself becomes internally scrollable, allowing the user to easily reach the bottom buttons.
