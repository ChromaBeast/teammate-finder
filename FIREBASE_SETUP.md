# Firebase Setup Guide

## Current Issue
You're experiencing: `Missing or insufficient permissions` error when trying to save team requests after payment.

**Payment ID:** `pay_RgkijRJdKpf1Bm` (Payment was successful, but Firestore save failed)

## Solution: Deploy Firestore Security Rules

### Step 1: Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase in Your Project
```bash
cd /home/user/teammate-finder
firebase init firestore
```

When prompted:
- Select your Firebase project
- Use `firestore.rules` as your rules file (already created)
- Press Enter for the default indexes file

### Step 4: Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

## Alternative: Manual Deployment via Firebase Console

If you prefer to use the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules` and paste them into the editor
5. Click **Publish**

## Firestore Security Rules Explanation

The rules in `firestore.rules` do the following:

```javascript
// Users can only read their own requests
allow read: if request.auth != null &&
               resource.data.userId == request.auth.uid;

// Users can create requests if they're authenticated
// and the userId in the document matches their auth ID
allow create: if request.auth != null &&
                 request.resource.data.userId == request.auth.uid;
```

### Key Points:
- ✅ Users must be authenticated (signed in with Google)
- ✅ Users can only create/read/update/delete their own requests
- ✅ The `userId` field must match the authenticated user's ID
- ✅ All required fields must be present when creating a request

## Verify the Fix

After deploying the rules:

1. Sign in to your app
2. Select a game and fill in the details
3. Complete the payment
4. The request should now save successfully to Firestore
5. Check your dashboard to see the new request

## Common Issues

### Issue: "permission-denied" error persists
**Solution:** Make sure you're signed in with Google before making a payment

### Issue: "PERMISSION_DENIED: Missing or insufficient permissions"
**Solution:**
1. Double-check that the rules are deployed: `firebase deploy --only firestore:rules`
2. Clear your browser cache and cookies
3. Sign out and sign back in

### Issue: Rules deployed but still not working
**Solution:**
1. Open browser DevTools → Console
2. Look for any Firebase errors
3. Verify your Firebase config in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## Test Your Setup

Run this test after deploying rules:

1. Open your app
2. Sign in with Google
3. Open browser DevTools → Console
4. Run this test code:
```javascript
// Test Firestore write permissions
const testDoc = {
  userId: firebase.auth().currentUser.uid,
  game: 'valorant',
  teamSize: 'duo',
  rank: 'Silver 1',
  region: 'asia',
  preferredPlayTime: 'evening',
  price: 50,
  status: 'pending',
  createdAt: new Date()
};

firebase.firestore()
  .collection('teamRequests')
  .add(testDoc)
  .then(() => console.log('✅ Write successful!'))
  .catch(err => console.error('❌ Write failed:', err));
```

## Need More Help?

Check `SETUP_TROUBLESHOOTING.md` for comprehensive debugging steps.

## Your Current Error Details

```
Error: Missing or insufficient permissions
Payment ID: pay_RgkijRJdKpf1Bm
Status: Payment successful, Firestore write blocked
```

**Action Required:** Deploy the security rules using one of the methods above.
