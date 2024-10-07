// cleanupNbaTeams.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); // Use your Firebase service account key JSON

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const cleanupDuplicates = async () => {
  const teamsCollection = db.collection('nbaTeams');

  try {
    const teamsSnapshot = await teamsCollection.get();
    const teamsData = {};

    // Group teams by name
    teamsSnapshot.forEach((doc) => {
      const teamName = doc.data().name.toLowerCase();
      if (teamsData[teamName]) {
        teamsData[teamName].push(doc.id);
      } else {
        teamsData[teamName] = [doc.id];
      }
    });

    // Identify and delete duplicates
    for (const [teamName, docIds] of Object.entries(teamsData)) {
      if (docIds.length > 1) {
        // Keep the first document, delete the rest
        console.log(`Found duplicates for team "${teamName}":`, docIds);
        const [keepDocId, ...duplicates] = docIds;

        for (const duplicateId of duplicates) {
          await teamsCollection.doc(duplicateId).delete();
          console.log(`Deleted duplicate document: ${duplicateId}`);
        }
        console.log(`Kept document: ${keepDocId}`);
      }
    }

    console.log('Duplicate cleanup completed.');
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
  }
};

// Run the cleanup function
cleanupDuplicates();
