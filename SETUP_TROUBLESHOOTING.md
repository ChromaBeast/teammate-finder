# Setup Troubleshooting Guide

## "Payment successful but failed to save request" Error

If you see this error after payment, it means Razorpay processed the payment successfully but the app couldn't save the request to Firestore. Here's how to fix it:

### 1. Check Firebase Configuration

Make sure your `.env.local` file has all the correct Firebase credentials:

```bash
# Open browser console (F12) and check for errors
# Look for messages like "Firebase: Error (auth/...)" or "Firestore: Missing or insufficient permissions"
```

### 2. Verify Firestore Security Rules

Go to [Firebase Console](https://console.firebase.google.com/) → Your Project → Firestore Database → Rules

Make sure you have these rules set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /teamRequests/{request} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

Click "Publish" after updating the rules.

### 3. Check Firestore Database Creation

1. Go to Firebase Console → Firestore Database
2. If you see "Create database", click it
3. Choose **Start in production mode** (we'll use security rules)
4. Select a location (closest to your users)
5. Click "Enable"

### 4. Verify Authentication is Working

1. Open browser DevTools (F12)
2. Go to Console tab
3. Before making a payment, check if you're logged in:
   ```javascript
   // You should see user info in the navbar
   // If not, click "Sign In" first
   ```

### 5. Check Browser Console for Detailed Errors

When the error occurs:

1. Open DevTools (F12) → Console
2. Look for red error messages
3. Common errors and fixes:

   **Error: "Missing or insufficient permissions"**
   - Solution: Update Firestore security rules (see step 2)

   **Error: "Firebase: Error (auth/unauthorized-domain)"**
   - Solution: Add your domain to Firebase Console → Authentication → Settings → Authorized domains

   **Error: "QUOTA_EXCEEDED"**
   - Solution: Check Firebase Console → Firestore → Usage tab. You might have hit free tier limits.

### 6. Test Firestore Connection

Create a test file `test-firestore.html` in the public folder:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Firestore</title>
</head>
<body>
  <h1>Test Firestore Connection</h1>
  <button onclick="testWrite()">Test Write</button>
  <div id="result"></div>

  <script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
    import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    window.testWrite = async function() {
      try {
        const docRef = await addDoc(collection(db, 'testCollection'), {
          test: 'data',
          timestamp: new Date()
        });
        document.getElementById('result').innerHTML =
          '<p style="color: green;">Success! Doc ID: ' + docRef.id + '</p>';
      } catch (error) {
        document.getElementById('result').innerHTML =
          '<p style="color: red;">Error: ' + error.message + '</p>';
        console.error(error);
      }
    };
  </script>
</body>
</html>
```

### 7. Common Issues Checklist

- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Authentication enabled (Google provider)
- [ ] Security rules published
- [ ] `.env.local` file exists with correct values
- [ ] User is signed in before payment
- [ ] Browser console shows no errors
- [ ] Internet connection is stable

### 8. Still Not Working?

If you've tried everything above:

1. **Check the browser console** - The actual error message will be there
2. **Check Firebase Console** → Firestore → Data - Can you manually add a document?
3. **Check Firebase Console** → Firestore → Usage - Any quota issues?
4. **Try in incognito mode** - Rules out browser cache issues
5. **Check network tab** - Are API calls being blocked?

### 9. Development vs Production

For development/testing, you can temporarily use these permissive rules (NOT for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This allows all authenticated users to read/write anywhere. Good for testing, but change to the proper rules before deploying.

### 10. Contact Support

If none of the above works, open an issue with:
- Full error message from browser console
- Firebase project region
- Browser version
- Screenshots of Firebase Console settings
