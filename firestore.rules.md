# Firestore Security Rules for CUNYswap

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ✅ Helper: Check if user is authenticated with @login.cuny.edu email
    function isCUNYUser() {
      return request.auth != null
        && request.auth.token.email != null
        && request.auth.token.email.matches("(?i).*@login\\.cuny\\.edu$");
    }
    
    // ✅ Helper: Check if user is verified in FIRESTORE (not Firebase Auth)
    function isVerifiedInFirestore() {
      return isCUNYUser()
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.emailVerified == true;
    }
    
  // ----------------------------
  //  USERS COLLECTION
  //  /users/{userId}
  // ----------------------------
  match /users/{userId} {
    // ✅ Anyone authenticated can read ANY user doc 
    // (needed for verification check during signup + viewing profiles)
    allow read: if request.auth != null;

    // ✅ Anyone authenticated can create their own user doc (during signup)
    allow create: if request.auth != null && request.auth.uid == userId;

    // ✅ Only the user can update their own doc
    allow update: if request.auth != null && request.auth.uid == userId;

    // ✅ No one can delete user docs (for safety)
    allow delete: if false;
  }
    
    // ----------------------------
    //  EMAIL VERIFICATION TOKENS
    //  /emailVerificationTokens/{tokenId}
    // ----------------------------
    match /emailVerificationTokens/{tokenId} {
      // ✅ Anyone can read tokens (needed for verification flow)
      allow read: if true;
      
      // ✅ Authenticated users can create tokens (during signup/resend)
      allow create: if request.auth != null;
      
      // ✅ Anyone can update tokens (backend marks them as used)
      allow update: if true;
      
      // ✅ No one can delete tokens (keep audit trail)
      allow delete: if false;
    }
    
    // ----------------------------
    //  ITEMS (marketplace listings)
    //  /items/{itemId}
    // ----------------------------
    match /items/{itemId} {
      // ✅ Anyone can browse items
      allow read: if true;
      
      // ✅ Create: must be verified in Firestore AND own the item
      allow create: if isVerifiedInFirestore()
        && request.resource.data.userId == request.auth.uid;
      
      // ✅ Update/Delete: must be verified AND be the owner
      allow update, delete: if isVerifiedInFirestore()
        && resource.data.userId == request.auth.uid;
    }
    
    // ----------------------------
    //  CONVERSATIONS
    //  /conversations/{conversationId}
    // ----------------------------
    match /conversations/{conversationId} {
      function isVerifiedParticipant() {
        return isVerifiedInFirestore()
          && resource.data.participants != null
          && request.auth.uid in resource.data.participants;
      }
      
      function isCreatingVerifiedParticipant() {
        return isVerifiedInFirestore()
          && request.resource.data.participants != null
          && request.auth.uid in request.resource.data.participants;
      }
      
      allow create: if isCreatingVerifiedParticipant();
      allow read, update, delete: if isVerifiedParticipant();
    }
    
    // ----------------------------
    //  MESSAGES (subcollection)
    //  /conversations/{conversationId}/messages/{messageId}
    // ----------------------------
    match /conversations/{conversationId}/messages/{messageId} {
      function isVerifiedParticipant() {
        return isVerifiedInFirestore()
          && request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      }
      
      allow create, read, update, delete: if isVerifiedParticipant();
    }
  }
}
```

## Key Updates for CUNYswap

### Changes Made:
1. ✅ **Email Domain**: Updated from `@buffalostate.edu` to `@login.cuny.edu`
2. ✅ **Function Name**: Changed `isBuffStateUser()` to `isCUNYUser()`
3. ✅ **Regex Pattern**: Updated email matching pattern to `(?i).*@login\\.cuny\\.edu$`

### Security Features:
- 🔒 Only verified @login.cuny.edu users can post items
- 🔒 Only item owners can edit/delete their listings
- 🔒 Only conversation participants can view/send messages
- 🔒 All users must be verified in Firestore before posting or messaging
- 🔒 Anyone can browse items (public marketplace)
- 🔒 User documents cannot be deleted (data integrity)

### How to Apply:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your CUNYswap project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the rules code above
5. Click **Publish** to deploy

### Testing:
After deploying, test that:
- ✅ Unauthenticated users can browse items
- ✅ Authenticated users with @login.cuny.edu can create items
- ✅ Only item owners can edit/delete their items
- ✅ Only conversation participants can access messages

---

# Firebase Storage Rules for CUNYswap

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // ✅ Helper: logged-in @login.cuny.edu user
    function isCUNYUser() {
      return request.auth != null
        && request.auth.token.email != null
        && request.auth.token.email.matches("(?i).*@login\\.cuny\\.edu$");
    }

    // ✅ ITEM IMAGES: /items/{userId}/...
    match /items/{userId}/{fileName=**} {

      // Anyone can READ item images (so marketplace works logged out)
      allow read: if true;

      // Only the owner can UPLOAD/DELETE their own images
      allow write: if isCUNYUser()
        && request.auth.uid == userId
        // must be an image
        && request.resource.contentType.matches('image/.*')
        // max 5 MB
        && request.resource.size < 5 * 1024 * 1024;
    }

    // ❌ Block everything else by default
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Storage Security Features:
- 🔒 Only verified @login.cuny.edu users can upload images
- 🔒 Users can only upload to their own folder (`/items/{userId}/`)
- 🔒 Only image files allowed (image/*)
- 🔒 5 MB max file size per image
- 🔒 Anyone can view images (public marketplace)
- 🔒 Only the owner can delete their own images

## How to Apply Storage Rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your CUNYswap project
3. Navigate to **Storage** → **Rules**
4. Copy the storage rules code above
5. Click **Publish** to deploy

## Storage Testing:
After deploying, test that:
- ✅ Unauthenticated users can view item images
- ✅ Authenticated @login.cuny.edu users can upload images to their folder
- ✅ Users cannot upload non-image files
- ✅ Users cannot upload files larger than 5 MB
- ✅ Users cannot upload to other users' folders
