# 💰 SpendWise – Personal Finance Management Application

**Take control of your money. Track your spending. Build better financial habits. 🚀**

---

## 📌 Table of Contents

1. 🌟 About the Project
2. ✨ Features
3. 🛠️ Tech Stack
4. 📊 Application Modules
5. 🏗️ Project Architecture
6. ⚙️ Getting Started
7. 🔐 Environment Variables
8. 🗄️ Database Structure
9. 🔗 API Overview
10. 🚀 Deployment
11. 🔒 Security
12. 🎯 Future Enhancements
13. 👩‍💻 Project Links & Owner

---

## 🌟 About the Project

**SpendWise** is a full-stack personal finance management application designed to help users manage their money more effectively.

It provides a centralized platform to record income and expenses, organize transactions into categories, monitor budgets, track savings goals, and understand spending patterns through visual analytics.

Instead of managing finances manually, users can use SpendWise to keep their financial information organized and make better financial decisions.

### 🎯 Project Objectives

- 💵 Track income and expenses in one place.
- 📂 Organize transactions using customizable categories.
- 📊 Understand spending patterns through visual analytics.
- 🎯 Set budgets and monitor spending limits.
- 🏦 Create and track personal savings goals.
- 📄 Generate financial reports and export transaction data.
- 🔐 Provide secure, user-specific financial information.

## ✨ Features

### 🔐 1. User Authentication

- User registration and login.
- Secure password hashing.
- JWT-based authentication.
- Protected application routes.
- Logout functionality.
- User-specific financial records.

### 📊 2. Dashboard Overview

- View a summary of financial activities.
- Monitor income and expenses.
- Track financial balance.
- View recent transactions.
- Monitor budget progress.
- Access important financial information from one dashboard.

### 💳 3. Transaction Management

- Add new income and expense transactions.
- Edit existing transactions.
- Delete transactions.
- Assign categories to transactions.
- Add descriptions and payment methods.
- Select transaction dates.
- Filter transactions by date, type, and category.

### 🏷️ 4. Category Management

- Separate income and expense categories.
- Use predefined default categories.
- Create custom categories.
- Update custom categories.
- Delete custom categories.
- Organize financial records more effectively.

### 🎯 5. Budget Management

- Create monthly budgets.
- Assign budgets to expense categories.
- Update budget amounts.
- Delete budgets.
- Monitor spending against allocated budgets.
- Track budget utilization.

### 🏦 6. Savings Goals

- Create personal savings goals.
- Set target amounts.
- Record current savings progress.
- Add target dates.
- Update and delete savings goals.
- Monitor progress toward financial targets.

### 📈 7. Analytics

- Visualize income and expense patterns.
- Analyze monthly financial activity.
- Explore category-wise spending.
- Understand financial trends through charts.

### 📄 8. Reports and CSV Export

- View financial reports.
- Filter transaction records.
- Export transaction data into CSV format.
- Use exported records for further analysis.

---

## 🛠️ Tech Stack

SpendWise is developed using a modern full-stack architecture.

### 🎨 Frontend

| Technology | Purpose |
|---|---|
| React.js | Building the user interface |
| Vite | Frontend development and build tool |
| JavaScript | Application logic |
| HTML5 | Page structure |
| CSS3 | Styling and layouts |
| Axios | API communication |
| Recharts | Data visualization and charts |
| Lucide React | Icons |
| React Router | Application navigation |

### ⚙️ Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MySQL | Relational database |
| mysql2 | Database connectivity |
| JWT | Authentication |
| bcryptjs | Password hashing |
| dotenv | Environment configuration |
| CORS | Cross-origin resource sharing |

### ☁️ Deployment and Tools

| Tool | Purpose |
|---|---|
| Git | Version control |
| GitHub | Source code management |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| TiDB Cloud | MySQL-compatible cloud database |
| Postman | API testing |
| VS Code | Development environment |

---

## 📊 Application Modules

| Module | Description |
|---|---|
| Authentication | Registration, login, logout and protected routes |
| Overview | Financial summary and recent activity |
| Transactions | Income and expense management |
| Categories | Default and custom categories |
| Budgets | Monthly budget tracking |
| Savings Goals | Personal savings progress |
| Analytics | Financial data visualization |
| Reports | Financial reports and CSV export |

---

## 🏗️ Project Architecture

SpendWise follows a client-server architecture.

```text
                  👤 USER
                     |
                     v
          +----------------------+
          |   React Frontend     |
          |   (Vite + Axios)     |
          +----------------------+
                     |
                HTTP / REST API
                     |
                     v
          +----------------------+
          |   Node.js + Express  |
          |      Backend        |
          +----------------------+
                     |
              MySQL Connection
                     |
                     v
          +----------------------+
          |    TiDB Cloud        |
          |   MySQL Database     |
          +----------------------+
```

### 🔄 How It Works

1. Users interact with the SpendWise frontend.
2. The frontend sends API requests to the Express backend.
3. The backend validates requests and handles authentication.
4. The backend communicates with the MySQL-compatible database.
5. Database results are returned through the API.
6. The frontend displays updated financial information.

---

## ⚙️ Getting Started

Follow these steps to run SpendWise locally.

### 📋 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/) or a compatible TiDB Cloud database
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/) (recommended)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/chinnikavya123/Spendwise.git
```

Navigate into the project:

```bash
cd Spendwise
```

### 2️⃣ Install Frontend Dependencies

```bash
npm install
```

### 3️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

### 4️⃣ Configure Environment Variables

Create a `.env` file inside the `backend` folder.

Add your database connection details and authentication secret.

See the [Environment Variables](#-environment-variables) section below.

### 5️⃣ Start the Backend Server

From the `backend` directory, run:

```bash
npm start
```

The backend server runs on the configured port (typically `5000`).

### 6️⃣ Start the Frontend

Open another terminal.

Navigate to the project root:

```bash
cd Spendwise
```

Start the development server:

```bash
npm run dev
```

### 🎉 You're Ready!

Open the local development URL displayed by Vite, usually:

```text
http://localhost:5173
```

You can now register an account and start using SpendWise!

---

## 🔐 Environment Variables

### Backend Configuration

Create `backend/.env`:

```env
PORT=5000

DB_HOST=your_database_host
DB_PORT=4000
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=spendwise

DB_SSL=true

JWT_SECRET=your_secure_jwt_secret

CLIENT_URL=http://localhost:5173
```

**Note:** Use the actual host, port, username and SSL settings provided by your database provider. For a local MySQL installation, configure the corresponding local connection settings.

### Frontend Configuration

Create a `.env` file in the frontend project root:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, configure the deployed backend API URL in your Vercel environment variables.

⚠️ **Important:** Never commit `.env` files, database passwords, JWT secrets, or other sensitive credentials to GitHub.

---

## 🗄️ Database Structure

SpendWise uses a relational database with the following main tables:

| Table | Purpose |
|---|---|
| `users` | Stores registered user information |
| `categories` | Stores default and custom categories |
| `transactions` | Stores income and expense records |
| `budgets` | Stores monthly category budgets |
| `savings_goals` | Stores personal savings goals |

### 🔗 Database Relationships

- A user can have multiple transactions.
- A user can create multiple custom categories.
- A category can be associated with multiple transactions.
- A user can create multiple budgets.
- A user can maintain multiple savings goals.
- Default categories can be shared across users.

---

## 🔗 API Overview

The backend exposes REST API endpoints for application functionality.

| Module | Endpoint | Method |
|---|---|---|
| Authentication | `/api/auth/register` | POST |
| Authentication | `/api/auth/login` | POST |
| Categories | `/api/categories` | GET |
| Categories | `/api/categories` | POST |
| Categories | `/api/categories/:id` | PUT |
| Categories | `/api/categories/:id` | DELETE |
| Transactions | `/api/transactions` | GET |
| Transactions | `/api/transactions` | POST |
| Budgets | `/api/budgets` | GET |
| Savings Goals | `/api/savings-goals` | GET |
| Dashboard | `/api/dashboard/summary` | GET |
| Reports | `/api/reports` | GET |

**Note:** These are the main API routes. Refer to the backend source code for the complete endpoint list and supported request parameters.

---

## 🚀 Deployment

SpendWise is deployed using cloud-based services.

### 🌐 Frontend

**Vercel** – Frontend hosting and deployment.

### ⚙️ Backend

**Render** – Backend hosting and API deployment.

### 🗄️ Database

**TiDB Cloud** – MySQL-compatible cloud database.

---

## 🔒 Security

SpendWise includes several security measures:

- JWT-based authentication.
- Password hashing using bcryptjs.
- Protected backend routes.
- User-specific database queries.
- Environment-based secret management.
- CORS configuration for frontend-backend communication.

---

## 🎯 Future Enhancements

Some ideas for extending SpendWise further:

- 🤖 More advanced AI-powered financial insights.
- 📱 Enhanced mobile experience.
- 📊 More detailed financial visualizations.
- 🔔 Budget and savings notifications.
- 📅 Recurring transaction support.
- 📥 Additional report formats.

---

## 👩‍💻 Project Links & Owner

**🌐 Live Demo:** [SpendWise – Personal Finance Management](https://spendwise-chinnikavya.vercel.app/)

**📂 GitHub Repository:** [SpendWise Repository](https://github.com/chinnikavya123/Spendwise)

**👩‍💻 Owner:** Chinni Kavya Sri
