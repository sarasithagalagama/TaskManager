# Task Manager

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

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
<img width="799" height="1073" alt="screencapture-localhost-8080-2025-07-13-22_16_51" src="https://github.com/user-attachments/assets/062a2eb4-ea7d-42c4-9984-4befded0f4dd" />


---
Feel free to customize and extend this project for your needs!
