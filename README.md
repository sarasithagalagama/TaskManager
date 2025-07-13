# Task Manager

A modern, full-stack Task Manager application with a Spring Boot backend and a beautiful dark-themed HTML/Tailwind/Bootstrap/JavaScript frontend.

## Features
- **Project Management:** Create, edit, and delete projects.
- **Task Management:** Create, edit (modal popup), and delete tasks.
- **Assign Tasks to Projects:** Each task is linked to a project.
- **Status Tracking:** Tasks can be marked as Pending, In Progress, or Completed.
- **Project Name Display:** The project assigned to each task is shown next to the task status.
- **Modern UI:** Responsive, dark-themed interface using Tailwind CSS and Bootstrap.

## Getting Started

### Prerequisites
- Java 17 or later
- Maven

### Backend Setup (Spring Boot)
1. Open a terminal in the `taskmanager` directory.
2. Run the backend:
   ```
   ./mvnw spring-boot:run
   ```
   Or on Windows:
   ```
   mvnw.cmd spring-boot:run
   ```
3. The backend will start on [http://localhost:8080](http://localhost:8080).

### Frontend Setup
- The frontend is served as static files from `src/main/resources/static/`.
- Open [http://localhost:8080](http://localhost:8080) in your browser to use the app.

## Usage
- **Add a Project:** Use the Projects section to add a new project.
- **Add a Task:** Use the Tasks form to add a new task and assign it to a project.
- **Edit a Task:** Click the Edit button on a task to open a modal and update any field.
- **Delete:** Remove projects or tasks with the Delete button.
- **Status & Project:** See the status and assigned project badge next to each task title.

## Technologies Used
- Spring Boot (Java, REST API)
- Tailwind CSS
- Bootstrap
- Vanilla JavaScript

## Screenshots
![Task Manager UI](screenshot.png)

---
Feel free to customize and extend this project for your needs!