# TransitOps – Smart Transport Operations Platform 🚚

TransitOps is a comprehensive, enterprise-grade Transport Management System designed for modern logistics companies to manage fleet operations, track expenses, dispatch trips, and monitor driver safety in real-time.

---

## 🏗️ Tech Stack

### Frontend (Client-side)
* **Framework:** React 18
* **Build Tool:** Vite
* **Styling:** Custom Vanilla CSS (with responsive grid/flexbox and glassmorphism design)
* **Routing:** React Router DOM
* **Data Visualization:** Chart.js & React-Chartjs-2
* **HTTP Client:** Axios
* **Icons:** React Icons

### Backend (Server-side)
* **Framework:** Java 17 / Spring Boot 3
* **Security:** Spring Security with JWT (JSON Web Tokens) Authentication
* **ORM:** Hibernate / Spring Data JPA
* **Database:** MySQL
* **Build Tool:** Maven

---

## ⚙️ Core Workflow & Features

TransitOps provides a Role-Based Access Control (RBAC) environment. When a user authenticates, they are served dynamic capabilities based on their specific role within the logistics organization.

1. **Authentication & RBAC:** Users log in securely via JWT. Roles dictate data access (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst).
2. **Dashboard Analytics:** A real-time overview displaying Key Performance Indicators (KPIs) like total fleet size, active drivers, dispatched trips, vehicles in the shop, and operational costs.
3. **Fleet Management:** Full CRUD operations for managing vehicles, updating their operational status, and scheduling maintenance.
4. **Driver & Safety Management:** Maintain driver profiles, track license expirations, and monitor driver safety scores.
5. **Trip Dispatching:** Create and assign trips to drivers and vehicles, tracking them from 'Scheduled' to 'In Progress' to 'Completed'.
6. **Financial & Expense Tracking:** Log fuel consumption and operational expenses to calculate total fleet running costs.

---

## 🗄️ Database Schema Overview

The MySQL database schema relies on Spring Data JPA to map Java entities to relational tables. The core entities include:

* `User`: Manages authentication credentials, JWT tokens, and RBAC roles.
* `Vehicle`: Stores fleet assets, including make, model, year, license plate, VIN, and current operational status.
* `Driver`: Manages personnel, including contact info, license numbers, and safety scores.
* `Trip`: Associates a `Driver` and a `Vehicle` for a specific route (origin to destination) along with status and timestamps.
* `MaintenanceLog`: Relates to a `Vehicle` to track repair history, costs, and maintenance dates.
* `FuelLog`: Tracks fuel pumped into specific `Vehicle`s, including volume and cost.
* `Expense`: General ledger for logging other operational expenses.

---

## 🚀 Getting Started

### Prerequisites
* JDK 17
* Node.js (v18+)
* MySQL Server (running on port 3306)

### 1. Database Setup
1. Open your MySQL client and run: `CREATE DATABASE transitops_db;`
2. The Spring Boot backend will automatically generate the schema via Hibernate `update`.
3. Default user accounts are automatically seeded into the database on the first boot by the `DatabaseSeeder` component.

### 2. Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Update your MySQL credentials (username/password) in `src/main/resources/application.properties` if they differ from the defaults.
3. Run the Spring Boot server: `./mvnw spring-boot:run`
4. The API will start on `http://localhost:8080`.

### 3. Frontend Setup
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
4. Access the web application at `http://localhost:5173`.

---

## 🔒 User Roles & Permissions

| Role | Permissions |
|---|---|
| **Fleet Manager** | Full access to all modules including vehicles, drivers, trips, maintenance, fuel, and expenses. |
| **Dispatcher** | Read/write access to trips and drivers. Read-only access to vehicles. |
| **Safety Officer** | Read/write access to driver profiles and safety scores. Read-only access to trips. |
| **Financial Analyst** | Read-only access to all assets. Read/write access to fuel logs and expenses. Full reports access. |
