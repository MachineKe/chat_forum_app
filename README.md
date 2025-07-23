# Chat + Forum App

A full-stack chat and forum application with custom JWT authentication and optional simulated Active Directory (LDAP) login.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), React Router DOM, Axios, Tailwind CSS, Socket.IO-client, React Icons
- **Backend:** Node.js, Express, MySQL (mysql2/Sequelize), JWT, bcrypt, Socket.IO, ldapjs, dotenv, cors

---

## 📁 Folder Structure

```
/backend
  /controllers
  /middlewares
  /models
  /routes
  /services
  .env.example

/frontend
  /components
  /layouts
  /pages
  /hooks
  .env.example

README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd <repo-folder>
```

---

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL and JWT config
npm install
npm run dev
```

- **Custom JWT Auth:** Register/login with email & password (bcrypt-hashed, JWT sessions)
- **Simulated LDAP Auth:** Uses `ldapjs` for mock Active Directory login. Configure `LDAP_URL` and `LDAP_BASE_DN` in `.env`. You can simulate LDAP with hardcoded credentials or a local LDAP server.

---

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env if needed (API/SOCKET URLs)
npm install
npm run dev
```

---

### 4. Database Setup

run migrations:

```bash
npx sequelize-cli db:migrate
```

---

### 5. Running the App

- **Backend:** `npm run dev` (http://localhost:5000)
- **Frontend:** `npm run dev` (http://localhost:5173)

---

## 🔐 Authentication

- **JWT Auth:** Register/login with email & password, bcrypt-hashed, JWT-protected routes.
- **LDAP Auth:** Toggle login method in UI. Simulated via `ldapjs` (see backend `.env`).

---

## 💬 Features

- Real-time one-to-one chat (Socket.IO)
- Forum with CRUD posts, comments, and optional likes/upvotes
- Responsive UI with Tailwind CSS
- Toast notifications, error boundaries, loading spinners
- Clean, reusable React components

---

## 📝 Notes

- Both backend and frontend have `.env.example` files—copy and configure as `.env`.
- For simulated LDAP, you can use hardcoded credentials or set up a local LDAP server for testing.
- All code is modular and developer-friendly for easy scaling.

---
# chat_forum_app
