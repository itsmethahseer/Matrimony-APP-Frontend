# HelpMeet Matrimony Application - Expo React Native Frontend

A universal React Native (Expo) mobile & web application for **HelpMeet** - a premium matrimony service. Featuring dynamic match discovery, horizontal photo swiping, category filtering, interaction tracking, real-time messaging, subscription plans, photo & identity verification, elevated floating sub-tab navigation, and an integrated Admin Console.

---

## ✨ Key Features & UX Improvements

1. **🎨 Royal Emerald & Warm Gold Theme**:
   - **Primary Brand Color**: `#065f46` (Deep Royal Emerald Green)
   - **Secondary Accent**: `#d97706` (Warm Golden Amber)
   - **Background & Cards**: `#f8fafc` (Crisp Slate Warm White) & `#ffffff` (Pure White Card Surface)

2. **📱 Floating Sub-Tab Navigation Bar**:
   - Elevated Instagram-style floating sub-tab capsule (`borderRadius: 28`, `elevation: 10`, `shadowRadius: 16`).
   - Floating corner clearances (`bottom: 22` on iOS / `14` on Android, `left: 16`, `right: 16`) for effortless touch access to Discover and Account screens without edge compression.

3. **🖼️ Horizontal Photo Carousel**:
   - Swipe left and right to view multiple uploaded photos on each user profile card in the Discover match feed.
   - Dynamic photo indicator dots (`• • •`) highlight the active photo index.

4. **🔋 System Status Bar Clearance**:
   - Android & iOS status bar top inset spacing (`paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0`).
   - High-contrast dark status bar icons ensure battery percentage, charging state, Wi-Fi, cellular range, and time remain perfectly visible.

---

## 💳 Subscriptions & Dynamic Quota System

Subscriptions replenish user contact view credits, messaging balance, call minutes, and validity:

* **Silver Plan**: **₹299** (20 Contact Views, 200 Messages, 60 Call Mins, 30 Days Validity)
* **Gold Plan**: **₹1,299** (100 Contact Views, 1000 Messages, 300 Call Mins, 90 Days Validity)
* **Platinum Plan**: **₹2,499** (9999 Contact Views, 9999 Messages, 1000 Call Mins, 180 Days Validity)

---

## 🛡️ Admin Console & Verification Workflow

1. **User Photo & ID Verification**:
   - User uploads identity documents or profile photos.
   - Newly uploaded photos display: `"⏳ Your uploaded photo will be verified shortly"` until approved by an admin.
   - Pending identity documents display: `"⏳ Your uploaded document will be verified shortly by our admin team."`

2. **Admin Validation Console**:
   - Accessible via the **Admin Console** option in the Account screen (or by logging in as `admin@matrimony.com`).
   - **Pending ID Docs**: Review submitted document images and click **Approve ID Document** or **Reject Document**.
   - **Pending Photos**: Review unapproved user profile photos and click **Approve Photo** or **Reject & Remove**.
   - **All Users Directory**: Overview of all registered user accounts, membership plans, and verification statuses.

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npx expo start
   ```

3. **Run on Web**:
   ```bash
   npx expo start --web
   ```

4. **Default Test Accounts**:
   - **Admin Account**: `admin@matrimony.com` / `admin123`
   - **User 1 (Male, Free)**: `ahmed@example.com` / `password123`
   - **User 2 (Female, Premium)**: `fatima@example.com` / `password123`
