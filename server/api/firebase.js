const FIREBASE_ADMIN = require('firebase-admin');

const serviceAccount = require("./serviceAccountKey.json"); // download from settings/service account on firebase console

FIREBASE_ADMIN.initializeApp({
  credential: FIREBASE_ADMIN.credential.cert(serviceAccount)
});

async function verifyIdTokenGetFirebaseUid(event){
    try {
        const id_token = event.id_token;
        console.log('inside verifyIdTokenGetFirebaseUid');

        return new Promise( (resolve,reject) =>{ 
            FIREBASE_ADMIN
            .auth()
            .verifyIdToken(id_token)
            .then((decodedToken) => {
                const firebase_uid = decodedToken.uid;
                console.log(`token is valid, firebase_uid:${firebase_uid}`);
                resolve(firebase_uid);
            })
            .catch((error) => {
                // Handle error
                console.error('firebase id token not valid');
                console.error(error);
                throw new Error('firebase id token not valid');
            });
    
        })            
    } catch (error) {
        console.log(error);
        console.error('firebase id token not valid');
        throw new Error('firebase id token not valid');
    }
}

module.exports = {
    verifyIdTokenGetFirebaseUid
}