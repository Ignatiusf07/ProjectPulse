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