
# ProjectPulse Kanban Board

ProjectPulse is a modern Kanban board web application built with React, Vite, and Firebase. It features user authentication, real-time task management, and user profile management with avatar upload.

## Features

- User registration and login (email/password, Google)
- Session timeout (auto logout after 5 minutes of inactivity)
- User profile page with display name and avatar upload
- Kanban board with To Do, In Progress, and Completed columns
- Real-time sync of tasks using Firebase Firestore
- Each user has their own board and profile
- Responsive design

## Tech Stack

- React
- Vite
- Firebase (Auth, Firestore, Storage)
- CSS Modules

## Getting Started

1. Clone the repository:
	 ```sh
	 git clone <your-repo-url>
	 cd sec
	 ```
2. Install dependencies:
	 ```sh
	 npm install
	 ```
3. Set up Firebase:
	 - Create a Firebase project and enable Auth, Firestore, and Storage.
	 - Update `src/firebase.js` with your Firebase config.
	 - Set Firestore rules to:
		 ```
		 service cloud.firestore {
			 match /databases/{database}/documents {
				 match /profiles/{userId} {
					 allow read, write: if request.auth != null && request.auth.uid == userId;
				 }
				 match /kanbanBoards/{userId} {
					 allow read, write: if request.auth != null && request.auth.uid == userId;
				 }
			 }
		 }
		 ```
4. Start the development server:
	 ```sh
	 npm run dev
	 ```

## Usage

- Register or log in to access your personal Kanban board.
- Manage tasks and move them between columns.
- Update your profile and upload an avatar.
- Log out manually or wait for session timeout.

## License

MIT
