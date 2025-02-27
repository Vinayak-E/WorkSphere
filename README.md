# WorkSphere Company Management System 

## 📌 Overview
The **WorkSphere** is a powerful application designed to help businesses efficiently manage their teams, track attendance, handle leave requests, assign and monitor projects, manage tasks, schedule meetings, and enable real-time communication between employees and managers.

## 🚀 Features
### **Authentication & User Management**
- Business owners register through the application.
- Super Admin approves or rejects business registrations.
- Approved businesses can add **managers and employees**.

### **Attendance & Leave Management**
- Employees can check-in/out for work.
- Managers can track attendance records.
- Employees can submit leave requests.
- Managers approve or reject leave requests.

### **Project & Task Management**
- Companies can **create projects**.
- Tasks can be assigned to **employees**.
- Employees update task progress.
- Managers track project status and completion.

### **Meetings & Scheduling**
- Companies and managers can schedule **meetings**.
- Employees receive notifications for scheduled meetings.

### **Real-time Chat & Communication**
- Employees and managers can chat in real-time.
- **One-on-one and group chats**.
- Media file sharing.

## 🛠️ Tech Stack
### **Backend**
- **Node.js** (Runtime Environment)
- **Express.js** (Web Framework)
- **MongoDB & Mongoose** (Database & ODM)
- **Socket.io** (Real-time Communication)
- **JWT** (Authentication)

### **Frontend**
- **React.js** (UI Library)
- **Vite** (Build Tool)
- **shadcn UI** (Component Library)
- **Zod** (Validation Library)


### **Others**
- **Cloudinary** (Media Storage)
- **Nodemailer** (Email Notifications)

---

## 🏗️ Setup Instructions

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/Vinayak-E/WorkSphere.git
cd WorkShere
```

### **2️⃣ Backend Setup**
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a **`.env`** file based on `.env.example`:
   ```ini
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ````
4. Start the backend server:
   ```sh
   npm start
   ```

### **3️⃣ Frontend Setup**
1. Navigate to the frontend folder:
   ```sh
   cd ../frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend server:
   ```sh
   npm start
   ```

---

## 📧 Contact
For queries, email: `vinayake056@gmail.com`

---

**Happy Coding! 🚀**

