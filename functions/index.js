/* eslint-env node */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: "http://localhost:5173" });

if (!admin.apps.length) {
  admin.initializeApp();
}

const nodemailer = require('nodemailer');  
  
exports.assignTask = functions.https.onRequest((req, res) => {  
  cors(req, res, async () => {  
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
  
      // Write task to recipient's board  
      const boardRef = admin.firestore().collection("kanbanBoards").doc(recipientUid);  
      const boardSnap = await boardRef.get();  
  
      let tasks = [];  
      if (boardSnap.exists) {  
        tasks = boardSnap.data().tasks || [];  
      }  
  
      await boardRef.set(  
        { tasks: [...tasks, newTask] },  
        { merge: true }  
      );  
  
      //Send email notification  
      const transporter = nodemailer.createTransport({  
      service: 'gmail',  
      auth: {  
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASSWORD  
      }  
    });
  
      const mailOptions = {  
       from: process.env.EMAIL_USER, 
        to: newTask.assignedTo,  
        subject: `New Task Assigned: ${newTask.title}`,  
        html: `  
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">  
            <h2 style="color: #4B2067;">You have been assigned a new task</h2>  
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">  
              <p><strong style="color: #009688;">Task:</strong> ${newTask.title}</p>  
              <p><strong style="color: #009688;">Description:</strong> ${newTask.description || 'No description'}</p>  
              <p><strong style="color: #009688;">Priority:</strong> <span style="color: ${newTask.priority === 'High' ? '#d32f2f' : '#555'};">${newTask.priority}</span></p>  
              <p><strong style="color: #009688;">Due Date:</strong> ${newTask.dueDate || 'Not set'}</p>  
              <p><strong style="color: #009688;">Assigned by:</strong> ${newTask.createdBy}</p>  
            </div>  
            <p style="color: #666;">Log in to ProjectPulse to view and manage this task.</p>  
          </div>  
        `  
      };  
  
      await transporter.sendMail(mailOptions);  
      console.log(`Email sent to ${newTask.assignedTo}`);  
  
      return res.status(200).send({ ok: true });  
    } catch (error) {  
      console.error("🔥 assignTask ERROR:", error);  
      return res.status(500).send({ error: "Server Error" });  
    }  
  });  
});
exports.deleteTask = functions.https.onRequest((req, res) => {  
  cors(req, res, async () => {  
    // Allow preflight OPTIONS request  
    if (req.method === "OPTIONS") {  
      return res.status(204).send("");  
    }  
  
    if (req.method !== "POST") {  
      return res.status(405).send({ error: "Method not allowed" });  
    }  
  
    try {  
      const { taskId, assignedToEmail } = req.body;  
  
      if (!taskId) {  
        return res.status(400).send({ error: "Missing taskId" });  
      }  
  
      // If task was assigned to someone, delete from their board too  
      if (assignedToEmail) {  
        const profilesRef = admin.firestore().collection("profiles");  
        const q = profilesRef.where("email", "==", assignedToEmail);  
        const snapshot = await q.get();  
  
        if (!snapshot.empty) {  
          const recipientUid = snapshot.docs[0].id;  
          const recipientBoardRef = admin.firestore().doc(`kanbanBoards/${recipientUid}`);  
          const recipientBoard = await recipientBoardRef.get();  
  
          if (recipientBoard.exists) {  
            const tasks = recipientBoard.data().tasks || [];  
            const updatedTasks = tasks.filter(task => task.id !== taskId);  
            await recipientBoardRef.update({ tasks: updatedTasks });  
          }  
        }  
      }  
  
      return res.status(200).send({ ok: true });  
    } catch (error) {  
      console.error("🔥 deleteTask ERROR:", error);  
      return res.status(500).send({ error: "Server Error" });  
    }  
  });  
});
exports.updateTaskAssignment = functions.https.onRequest((req, res) => {  
  cors(req, res, async () => {  
    if (req.method === "OPTIONS") {  
      return res.status(204).send("");  
    }  
  
    if (req.method !== "POST") {  
      return res.status(405).send({ error: "Method not allowed" });  
    }  
  
    try {  
      const { taskId, oldAssignedTo, newAssignedTo, updatedTask } = req.body;  
  
      if (!taskId || !updatedTask) {  
        return res.status(400).send({ error: "Missing taskId or updatedTask" });  
      }  
  
      // Remove from old assignee's board if exists  
      if (oldAssignedTo && oldAssignedTo !== updatedTask.createdBy) {  
        const oldProfilesRef = admin.firestore().collection("profiles");  
        const oldQuery = oldProfilesRef.where("email", "==", oldAssignedTo);  
        const oldSnapshot = await oldQuery.get();  
  
        if (!oldSnapshot.empty) {  
          const oldRecipientUid = oldSnapshot.docs[0].id;  
          const oldBoardRef = admin.firestore().doc(`kanbanBoards/${oldRecipientUid}`);  
          const oldBoard = await oldBoardRef.get();  
  
          if (oldBoard.exists) {  
            const tasks = oldBoard.data().tasks || [];  
            const updatedTasks = tasks.filter(task => task.id !== taskId);  
            await oldBoardRef.update({ tasks: updatedTasks });  
          }  
        }  
      }  
  
      // Add to new assignee's board if different from creator  
      if (newAssignedTo && newAssignedTo !== updatedTask.createdBy) {  
        const newProfilesRef = admin.firestore().collection("profiles");  
        const newQuery = newProfilesRef.where("email", "==", newAssignedTo);  
        const newSnapshot = await newQuery.get();  
  
        if (!newSnapshot.empty) {  
          const newRecipientUid = newSnapshot.docs[0].id;  
          const newBoardRef = admin.firestore().doc(`kanbanBoards/${newRecipientUid}`);  
          const newBoard = await newBoardRef.get();  
  
          let tasks = [];  
          if (newBoard.exists) {  
            tasks = newBoard.data().tasks || [];  
          }  
  
          await newBoardRef.set(  
            { tasks: [...tasks, updatedTask] },  
            { merge: true }  
          );  
  
          // Send email notification  
          const transporter = nodemailer.createTransport({  
            service: 'gmail',  
            auth: {  
              user: functions.config().email.user,  
              pass: functions.config().email.password  
            }  
          });  
  
          const mailOptions = {  
            from: functions.config().email.user,  
            to: newAssignedTo,  
            subject: `Task Reassigned: ${updatedTask.title}`,  
            html: `  
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">  
                <h2 style="color: #4B2067;">A task has been reassigned to you</h2>  
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">  
                  <p><strong style="color: #009688;">Task:</strong> ${updatedTask.title}</p>  
                  <p><strong style="color: #009688;">Description:</strong> ${updatedTask.description || 'No description'}</p>  
                  <p><strong style="color: #009688;">Priority:</strong> ${updatedTask.priority}</p>  
                  <p><strong style="color: #009688;">Due Date:</strong> ${updatedTask.dueDate || 'Not set'}</p>  
                </div>  
              </div>  
            `  
          };  
  
          await transporter.sendMail(mailOptions);  
        }  
      }  
  
      return res.status(200).send({ ok: true });  
    } catch (error) {  
      console.error("🔥 updateTaskAssignment ERROR:", error);  
      return res.status(500).send({ error: "Server Error" });  
    }  
  });  
});