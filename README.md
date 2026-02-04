# 💬 Realtime Chat Application

A full-stack **Realtime Chat Application** built using the **MERN stack** and **Socket.IO** for instant messaging.  
The app supports secure authentication, real-time communication, media sharing, and a modern responsive UI.

---

## 🚀 Features

- 🔐 User Authentication (JWT based)
- 💬 Real-time one-to-one chat using Socket.IO
- 🟢 Online / Offline user status
- 📎 Image & media sharing with Cloudinary
- ⚡ Fast & responsive UI (React + Vite)
- 📦 Scalable backend architecture
- 🔒 Secure environment variable handling

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- JavaScript
- Tailwind CSS
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication
- Cloudinary (Media Upload)

---

## 📂 Project Structure

realtimeChatApp/
├── backend/
│ ├── config/
│ ├── controllers/
│ ├── middlewares/
│ ├── models/
│ ├── routes/
│ ├── socket/
│ ├── public/
│ ├── index.js
│ ├── package.json
│ └── .gitignore
│
├── frontend/
│ ├── src/
│ ├── public/
│ ├── index.html
│ ├── vite.config.js
│ ├── package.json
│ └── .gitignore
│
└── README.md


---

## ⚙️ Environment Variables

Create a `.env` file inside the **backend** folder:

```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/realtimeChatApp
JWT_SECRET=your_jwt_secret

CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
⚠️ Do not commit .env to GitHub
Make sure .env is added to .gitignore.

▶️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/pankaj425/realtimeChatApp.git
cd realtimeChatApp
2️⃣ Backend Setup
cd backend
npm install
npm run dev
Server will start at:

http://localhost:8000
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev
Frontend will start at:

http://localhost:5173
🔌 Real-Time Communication
Real-time messaging handled using Socket.IO

Users receive messages instantly without page reload

Online / offline status updates in real time

📸 Media Upload
Images and media files are uploaded using Cloudinary

Secure storage and fast access

🔐 Security
JWT-based authentication

Password hashing

Environment variables protected using .env

🤝 Contributing
Contributions are welcome!

Fork the repository

Create a new branch

Commit your changes

Open a Pull Request

📄 License
This project is licensed under the MIT License.

👤 Author
Pankaj Maddheshiya
GitHub: https://github.com/pankaj425


---

### ✅ What I fixed / improved
- Clean markdown formatting
- Correct headings & spacing
- Proper project structure block
- Clear setup instructions
- Professional wording (GitHub-ready)

If you want next:
- ⭐ Add screenshots section  
- 🏷️ Add GitHub badges  
- 🌍 Add deployment guide (Render / Vercel)

Just say the word 👌
