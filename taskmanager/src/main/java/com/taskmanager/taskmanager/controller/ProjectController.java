package com.taskmanager.taskmanager.controller;

import com.taskmanager.taskmanager.model.Project;
import com.taskmanager.taskmanager.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin // Enable CORS for frontend access, remove if not needed
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return projectService.saveProject(project);
    }

    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Project updateProject(@PathVariable Long id, @RequestBody Project updatedProject) {
        return projectService.getProjectById(id)
            .map(project -> {
            project.setName(updatedProject.getName());
            project.setStatus(updatedProject.getStatus()); // Add this line!
            return projectService.saveProject(project);
            }).orElse(null);
    }


    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
    }
}
