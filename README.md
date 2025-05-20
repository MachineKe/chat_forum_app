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

### 4. MySQL Setup

Create a database and tables:

```sql
CREATE DATABASE chat_forum_app;

USE chat_forum_app;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_ldap_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
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
