package com.taskmanager.taskmanager.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.time.LocalDate;

@Entity
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING; // Default value

    private LocalDate dueDate;

    // Many tasks belong to one project
    @ManyToOne
    @JoinColumn(name = "project_id")
    @JsonBackReference
    private Project project;

    public enum Status {
        PENDING,
        IN_PROGRESS,
        COMPLETED
    }

    // Constructors
    public Task() {}
    public Task(String title, String description, Status status, LocalDate dueDate, Project project) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
        this.project = project;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
}
