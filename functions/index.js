/* eslint-env node */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: "http://localhost:5173" });

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.assignTask = functions.https.onRequest((req, res) => {
  // Enable CORS
  cors(req, res, async () => {

    // Allow preflight OPTIONS request
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).send({ error: "Method not allowed" });
    }

    try {
      const { recipientUid, newTask } = req.body;

      if (!recipientUid || !newTask) {
        return res.status(400).send({ error: "Missing recipientUid or newTask" });
      }

      const boardRef = admin.firestore().collection("kanbanBoards").doc(recipientUid);
      const boardSnap = await boardRef.get();

      let tasks = [];
      if (boardSnap.exists) {
        tasks = boardSnap.data().tasks || [];
      }

      // Add the new task and merge the document
      await boardRef.set(
        { tasks: [...tasks, newTask] },
        { merge: true }
      );

      return res.status(200).send({ ok: true });
    } catch (error) {
      console.error("🔥 assignTask ERROR:", error);
      return res.status(500).send({ error: "Server Error" });
    }

  });
});
