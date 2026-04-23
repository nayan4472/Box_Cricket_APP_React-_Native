# 🏏 Box Cricket App (React Native)

A modern React Native mobile application for instant turf booking, allowing users to quickly reserve box cricket grounds based on real-time availability.

---

## 🚀 Features

* 🔐 User Authentication (Login / Signup)
* 📍 Browse available box cricket turfs
* ⏰ Real-time slot availability
* 📅 Instant booking system
* 💳 Stripe payment integration
* 📱 Clean and responsive UI

---

## 🛠️ Tech Stack

* React Native (Expo)
* Node.js & Express
* MongoDB
* Stripe API

---

## 📁 Project Structure

```
├── app                # Main app screens (Expo Router)
├── assets             # Images & static files
├── backend
│   ├── models         # Database models
│   ├── routes         # API routes
│   ├── index.js       # Backend entry point
│   ├── .env           # Environment variables
│   ├── package.json
│
├── components         # Reusable UI components
├── constants          # Static data/constants
├── hooks              # Custom hooks
├── scripts            # Utility scripts
├── app.json           # Expo config
├── package.json       # Frontend dependencies
├── README.md
```

---

## 📦 Installation

```bash
git clone https://github.com/nayan4472/Box_Cricket_APP_React-_Native.git
cd Box_Cricket_APP_React-_Native
npm install
```

---

## ▶️ Run Frontend (Expo)

```bash
npx expo start
```

---

## ▶️ Run Backend

```bash
cd backend
npm install
node index.js
```

---

## 🔑 Environment Variables

Create `.env` file inside **backend** folder:

```
STRIPE_SECRET_KEY=your_secret_key_here
```

⚠️ Never expose your secret keys.

---

## ⚠️ Important Notes

* `.env` file should be added in `.gitignore`
* Do not push API keys to GitHub
* Make sure backend is running before booking/payment

---

## 👨‍💻 Author

**Nayan Pitroda**

---

## 📄 License

This project is licensed under the MIT License.
