# J. Sai Gajendra Portfolio — Firebase Admin + Real AI

This package adds:
- Firebase Authentication admin login for `jsai6305@gmail.com`
- Firestore-backed editable portfolio content
- Firebase Storage for dashboard images and resume PDF
- Admin panel at `/admin.html`
- Real AI chatbot backed by a Firebase HTTPS function and OpenAI Responses API

## 1. Firebase setup
1. Create/select a Firebase project and register a Web App.
2. Copy the Web App config into `public/firebase-config.js`.
3. Enable Authentication → Email/Password.
4. Create the admin user with email `jsai6305@gmail.com`.
5. Enable Firestore Database.
6. Enable Storage. Current Firebase documentation says Cloud Storage for Firebase requires the Blaze plan.
7. Deploy the Firestore and Storage rules in this package.

## 2. OpenAI secret
From the project root:

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

Enter your OpenAI API key when prompted. Never put this key in `public/` or browser JavaScript.

## 3. Install and deploy

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_PROJECT_ID
cd functions && npm install && cd ..
firebase deploy --only firestore:rules,storage,functions,hosting
```

The AI endpoint is exposed by the `chat` function. The public chatbot calls `/api/chat` when hosted behind a reverse proxy or rewrite. If using Firebase Hosting directly, add a Hosting rewrite to the function (or change the fetch URL to the deployed function URL).

## 4. Firebase Hosting rewrite
Add this inside `hosting` in `firebase.json`:

```json
"rewrites":[{"source":"/api/chat","function":{"functionId":"chat","region":"us-central1"}}]
```

## 5. Admin panel
Open `/admin.html`, sign in with the authorized Firebase account, then edit profile/skills/project/education content, upload a new resume, or upload/delete dashboard images.

## 6. Portfolio behavior
The existing portfolio remains the visual base. The Firebase layer is additive. If Firebase is not configured yet, the page uses the embedded/local portfolio content instead of failing completely.
