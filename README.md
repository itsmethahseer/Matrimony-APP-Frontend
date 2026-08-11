# Matrimony Application - Expo React Native Frontend

A universal React Native (Expo) frontend application for a premium matrimony service. Featuring dynamic match discovery, category filtering, user profile management, interaction tracking, real-time messaging, subscription plans, user verification, and an integrated Admin Console.

---

## 💳 Subscriptions & Dynamic Quota System

Subscriptions are dynamically managed per user. Upgrading replenishes user contact view credits, messaging balance, call minutes, and updates validity.

* **Silver Plan**: ₹299 (20 Contact Views, 200 Messages, 60 Call Mins, 30 Days Validity)
* **Gold Plan**: ₹1,299 (100 Contact Views, 1000 Messages, 300 Call Mins, 90 Days Validity)
* **Platinum Plan**: ₹2,499 (9999 Contact Views, 9999 Messages, 1000 Call Mins, 180 Days Validity)

---

## 🛡️ Admin Console & Verification Workflow

1. **User Identity Document & Photo Verification**:
   - User uploads identity document or profile photos.
   - Newly uploaded photos display the notice: `"Your uploaded photo will be verified shortly"` until approved by an admin.
   - Pending identity documents display: `"Your uploaded document will be verified shortly by our admin team."`

2. **Admin Validation Console**:
   - Accessible via the **Admin Console** option in the Account screen (or by logging in as `admin@matrimony.com`).
   - **Pending ID Documents**: Review user submitted document images and click **Approve ID Document** or **Reject Document**.
   - **Pending Photos**: Review user uploaded profile photos and click **Approve Photo** or **Reject & Remove**.
   - **User Accounts**: Overview of all registered accounts, membership plans, and verification statuses.

---

## 🚀 Getting Started

1. **Install dependencies**:
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
