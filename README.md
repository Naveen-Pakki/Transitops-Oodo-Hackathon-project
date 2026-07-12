# TransitOps – Smart Transport Operations Platform

TransitOps is an enterprise-grade Transport Management System designed for logistics companies to manage fleet operations.

## Project Structure
This repository contains:
- `backend/`: Java Spring Boot application (REST API, Spring Security JWT, JPA/Hibernate, MySQL).
- `frontend/`: React single page application (Vite, Plain CSS, Chart.js, React Icons).
- `database/`: Database schema, ER diagrams, and sample seeding scripts.
- `docs/`: Extra user and development guides.

## Tech Stack
- **Backend**: Java 17, Spring Boot, Spring Security (Simple JWT), Hibernate ORM, MySQL.
- **Frontend**: React, React Router, Axios, Chart.js, React Icons, Vanilla CSS.

## Getting Started

### Prerequisites
- JDK 17
- Node.js (v18+)
- MySQL Server

### Database Setup
1. Create a database called `transitops_db` in MySQL.
2. Run the DDL script in `database/schema.sql` to initialize tables.
3. Run the seed script in `database/sample_data.sql` to insert sample data.

### Backend Setup
1. Navigate to `backend/`.
2. Configure your MySQL credentials in `src/main/resources/application.properties`.
3. Run `./mvnw spring-boot:run` to start the backend API server on `http://localhost:8080`.

### Frontend Setup
1. Navigate to `frontend/`.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the local React development server on `http://localhost:5173`.
