# 🔥 Firebase Firestore Rules Setup

## 📋 Problem
You're getting "Missing or insufficient permissions" errors when trying to create Sales Orders because Firebase doesn't have rules configured for the new collections.

## ✅ Solution
You need to update Firestore Security Rules in Firebase Console.

---

## 🚀 Step-by-Step Instructions

### 1. Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select your project: **solarapp-12b70**
3. Click on **Firestore Database** in the left menu

### 2. Update Security Rules
1. Click on the **"Rules"** tab (at the top)
2. You should see the current rules editor

### 3. Copy & Paste New Rules
1. **DELETE** all existing rules in the editor
2. **COPY** the entire content from `firestore.rules` file
3. **PASTE** into the Firebase rules editor

### 4. Publish Rules
1. Click the **"Publish"** button
2. Wait for confirmation message: "Rules published successfully"

---

## 📝 New Collections Added

The updated rules now include permissions for:

- ✅ `sales_orders` - Main sales order documents
- ✅ `sales_order_activity` - Activity logs for audit trail
- ✅ `articoli` - Warehouse inventory (existing)
- ✅ `movimenti` - Inventory movements (existing)
- ✅ `importazioni_sap` - SAP import history (existing)
- ✅ All other existing collections

---

## 🔐 Security Level

Current rules allow:
- **Read/Write access** to authenticated users only
- Users must be logged in to access any data
- All operations require authentication via Firebase Auth

---

## ⚠️ Important Notes

1. **Do NOT skip this step** - The app will not work without proper Firestore rules
2. Rules apply **immediately** after publishing
3. Make sure you're in the correct Firebase project: `solarapp-12b70`
4. Keep a backup of old rules if you want (optional)

---

## 🧪 Test After Publishing

After publishing the rules:

1. Refresh your SolarApp in the browser
2. Go to **Warehouse Management → Sales Orders**
3. Click **"Create New Order"**
4. Upload an Excel file
5. Confirm - it should work now! ✅

---

## 🆘 Troubleshooting

If you still get permission errors:

1. **Hard refresh** the browser (Ctrl + Shift + R or Cmd + Shift + R)
2. **Clear cache** and reload
3. **Log out and log in** again in the app
4. **Check Firebase Console** → Rules tab to confirm rules are published
5. **Verify** you're using the correct Firebase project

---

## 📞 Need Help?

If issues persist, check:
- Firebase Console → Project Settings → Make sure it's `solarapp-12b70`
- Authentication is working (user is logged in)
- Network tab in browser DevTools for specific errors

---

**File Location:** `firestore.rules` (in project root)
**Last Updated:** January 2026
