# 📅 MyWeekly – Your Personal Automated Schedule Tracker

[🌐 Live Application](https://ninkorb.github.io/MyWeekly/)

---

## 🚀 About the Project

**MyWeekly** is a full-stack scheduling assistant designed to help users take control of their week. With intelligent automation, responsive design, and modern authentication, this platform offers more than just a to-do list—it builds your schedule for you.

Ideal for students, professionals, and developers, MyWeekly lets you define your week in advance and watch it organize itself based on your time preferences and availability.

---

## ✨ Features

- 🔐 **Secure Authentication**: Register and login with JWT-based session management and password hashing via bcrypt.js.
- 🧩 **Custom Weekly Task Templates**: Define task patterns for your week instead of manually adding daily tasks.
- 🤖 **Automated Smart Scheduling**: 
  - Set daily active hours (e.g., 9 AM – 10 PM)
  - Assign preferred time slots (Morning, Afternoon, Evening)
  - Let the scheduler intelligently fill your day
- 🕹️ **Manual Scheduling Support**: Fix tasks at exact times if needed.
- 📝 **Context-Aware Task Headings**: Dynamically enhanced titles based on linked content (e.g., GitHub, YouTube).
- 🎯 **Personal Weekly Rewards**: Set motivational rewards upon task completion.
- 📊 **Interactive Dashboard**: A modern UI showing tasks per day.
- 📱 **Fully Responsive UI**: Works seamlessly across desktop and mobile.

---

## 🛠️ Tech Stack

| Category       | Technologies                     |
|----------------|----------------------------------|
| **Frontend**   | HTML5, Tailwind CSS, Alpine.js   |
| **Backend**    | Node.js, Express.js              |
| **Database**   | MongoDB (Atlas), Mongoose        |
| **Auth & Security** | bcrypt.js, jsonwebtoken      |
| **Deployment** | GitHub Pages (Frontend), Render (Backend) |

---

## 📁 Project Structure

```
/MyWeekly/
├── index.html          # Frontend SPA
└── /backend/
    ├── server.js       # Express server setup
    ├── package.json    # Backend dependencies
    ├── .env            # Environment variables (MONGO_URI, JWT_SECRET)
    ├── .gitignore      # Ignored files (e.g., node_modules)
    ├── /models/
    │   └── User.js     # Mongoose schemas for users & tasks
    ├── /routes/
    │   ├── auth.js     # Auth routes: login, register, settings
    │   └── tasks.js    # Task CRUD routes
    └── /utils/
        └── scheduler.js # Core task auto-scheduling logic
```

---

## 🔮 Future Enhancements

- 🧲 Drag-and-drop scheduling for manual adjustments
- 📈 Analytics dashboard for productivity insights
- 📅 Google/Outlook Calendar sync
- 🔔 Push/email notifications for upcoming tasks
- ⏱️ Rule-based recurring task system

---

## 👨‍💻 Author

**Ninkor **  
Full-stack web developer focused on building scalable, responsive, and user-friendly applications.

### Connect with me:
- GitHub: [@NinkorB](https://github.com/NinkorB)
- LinkedIn: [linkedin.com/in/ninkor](https://www.linkedin.com/in/ninkor/)

---

> ⭐ Found this project helpful? Leave a star and share your feedback!
