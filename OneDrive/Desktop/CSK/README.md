CSK - Civil Services Kendra
A web platform for UPSC & TNPSC exam preparation.

Features
Separate UPSC & TNPSC course sections
Mock tests (Full Length & Subject Specific)
Video lectures & study materials
Course access based on payment
Admin panel for content management
User authentication (Email/Google)



Tech Stack
React + TypeScript + Vite
Tailwind CSS
Firebase (Auth, Firestore, Storage)

Setup
Clone the repo

git clone https://github.com/your-username/CSK_WEB.git
Install dependencies

cd react-app
npm install
Create a .env file in react-app/ with your Firebase config:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
Run locally

npm run dev
Admin Access
Only authorized emails can access the admin panel.

