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

## Date: 2026-03-08
**Git Commit Message:** `Fix: disable document upload inputs for fully verified KYC users EFP`

### KYC Requirement Override (EFP)

#### 1. EXPLAIN (What caused the confusion/bug)
Even though the user's overarching backend status had is_fully_verified: true (triggering the 100% Secure Citizen hero banner), the individual RequirementCard components were blindly checking their own isolated individual states (whether the user had uploaded a specific passport image). As a result, users who had bypassed individual uploads via manual admin approval were still being prompted with "Action Required" to upload files they didn't need to.

#### 2. FIX (The Immediate Action)
In index.jsx, I passed down the master status?.is_fully_verified boolean to each individual <RequirementCard /> component as a new prop.

#### 3. PRODUCTION (The Ultimate Dev Solution)
Inside RequirementCard.jsx, I added a master override. If isVerified is passed in as 	rue, the getStatusConfig function ignores the individual submission status and immediately forces the card into a green "Verified" UI state with a checkmark. Furthermore, I wrapped the upload buttons (<button onClick={() => setShowOptions(true)}>) in a conditional {!isVerified}, physically removing the ability for fully verified users to click the button or submit unnecessary documents to the server.

## Date: 2026-03-08
**Git Commit Message:** `Fix: reconnect dangling master-ledger API and repair Admin Dashboard header wrapping EFP`

### People Management Blank Ledger & Header Overlap (EFP)

#### 1. EXPLAIN (What caused the confusion/bug)
There were two distinct bugs on the Admin Dashboard component. 
First, the institutional header Foundation Terminal text was wrapping awkwardly across multiple lines and overlapping the tab menu. This happens because flexbox naturally shrinks child elements containing text when space gets tight.
Second, the People Ledger table was completely empty. This was a critical backend failure. Inside pp/api/admin_routes.py, the @router.get("/users/master-ledger") decorator was entirely disconnected from its function (iew_all_users()). It was floating at the top of the file, inadvertently decorating the wrong function dmin_promote_route(). When the frontend called for the master ledger, the backend threw an error instead of returning the user list.

#### 2. FIX (The Immediate Action)
On the frontend (dmin-dashboard/index.jsx), I added shrink-0 to the header's logo icons and wrapper divs, and applied whitespace-nowrap to the main terminal text and status pulse. This forbids the browser from stacking the words regardless of horizontal compression. I also made the Desktop Tab menu scrollable horizontally.
On the backend, I removed the dangling @router.get("/users/master-ledger") from line 38, scrolled down to line 63, and properly attached it directly above the def view_all_users() function.

#### 3. PRODUCTION (The Ultimate Dev Solution)
By locking the header text on a single line with whitespace-nowrap and shrink-0, the UI remains professional and intact across all viewport widths. By properly attaching the GET route to its dedicated function on the backend, the FastAPI framework can correctly serialize the full master list of users from the database, instantly repopulating the ledger table with all registered identities on the frontend.

## Date: 2026-03-08
**Git Commit Message:** `Feat: expand Admin PeopleLedger edit modal to support omni-directional profile edits EFP`

### Comprehensive Admin User Editing (EFP)

#### 1. EXPLAIN (What caused the confusion/bug)
Previously, the Admin Dashboard's People Management tab only allowed administrators to change two fields when clicking the Edit Icon: Full Legal Name and Email Address. However, a true administrative ledger requires omni-directional control over every property attached to an identity (like password resets, birth dates, KYC statuses, global account suspensions, and trading blockades).

#### 2. FIX (The Immediate Action)
First, I edited pp/schemas/admin.py and expanded the AdminUserUpdate Pydantic model to explicitly accept date_of_birth and password.
Next, in dmin-dashboard/components/PeopleLedger.jsx, I rewrote handleEditStart. Instead of blindly reusing the limited data from the ledger table, it now fires a GET /admin/users/{user_id} API request to fetch the user's entire unredacted profile. This fully saturates the React state editData with all their settings.
Finally, I built out the Edit Modal UI, transforming it into a max-height scrollable window loaded with inputs and dropdowns to precisely control Account Status (Active/Suspended), System Role (Admin/Citizen), KYC Status, Trading Blockades, passwords, and native text fields.

#### 3. PRODUCTION (The Ultimate Dev Solution)
By pulling the fresh user data directly from the API upon clicking Edit, the form guarantees that the admin isn't overriding a user's settings with stale ledger data. Furthermore, by stripping out the password property in JavaScript if the input remains empty before sending the PATCH request, it elegantly protects the backend from accidentally hashing and saving a blank string over the user's password!

## Date: 2026-03-08
**Git Commit Message:** `Feat: overhaul Settings page with security credentials and profile integration EFP`

### Multi-Tier Settings Dashboard (EFP)

#### 1. EXPLAIN (What caused the confusion/bug)
Initially, the user Settings page was a single, barebones form only capable of resetting a Transaction PIN. It lacked basic banking security features (Password Change), identity transparency (Profile viewing), and interface preferences (Dark/Light mode toggles). This created a disconnected UX where users felt they had no control over their digital vault.

#### 2. FIX (The Immediate Action)
I executed a full-stack upgrade:
- **Backend:** Added ChangePasswordRequest schema, implemented a secure change_password service (verifying old credentials before hashing new ones), and exposed the /auth/change-password endpoint.
- **Frontend:** Completely replaced the Settings component with a multi-column grid layout. I integrated the /users/me API to fetch real-time profile data, added a robust Password Change form, and implemented client-side state for theme toggles and notification preferences.
- **Simulations:** Added a "Sign Out of All Devices" action in a dedicated 'Danger Zone' section to provide the UX of global session management.

#### 3. PRODUCTION (The Ultimate Dev Solution)
For high-security operations like PIN resets, I implemented an identity verification step that requires the user to input their registered email, matching it against the backend record before permitting the update. This ensures that even if a physical device is compromised while unlocked, the most sensitive credentials (PIN/Password) remain protected by a secondary identity check.

## Date: 2026-03-08
**Git Commit Message:** `Fix: resolve inverted theme toggle and permanent profile loading state in Settings dashboard EFP`

### Settings UI Sync & Loading Robustness (EFP)

#### 1. EXPLAIN (What caused the confusion/bug)
Two UI bugs were identified in the new Settings Center: 
1. **Theme Inversion:** The Dark Mode toggle state was out of sync with the actual document class. This caused the toggle to appear 'ON' while the background remained White, or vice versa, because the initialization didn't account for the current html class on mount.
2. **Loading Hang:** The User Profile card was stuck on 'Loading...'. This happened because the frontend was strictly waiting for an API response from /users/me without a fallback, and any delay or minor data mismatch (like name vs full_name) prevented the state from updating.

#### 2. FIX (The Immediate Action)
I implemented a dual-fix strategy:
- **Theme Sync:** Added a useEffect hook that explicitly adds or removes the dark class from document.documentElement based on the saved state during the component's mounting phase. I also refined the toggle's CSS logic to use more intuitive 'On/Off' colors.
- **Loading Fallback:** Enhanced fetchProfile to immediately check localStorage as a fallback. If the API call fails or is slow, it saturates the user state with cached data (mapping name to full_name for compatibility), ensuring the UI renders instantly.

#### 3. PRODUCTION (The Ultimate Dev Solution)
Always implement "Graceful Degradation" for user profiles in banking apps. By using cached localStorage data as a placeholder while the secure API call is in flight, you eliminate the "Spinner of Death" effect, making the app feel significantly faster and more reliable to the end-user.

