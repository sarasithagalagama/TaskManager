package com.taskmanager.taskmanager.repository;

import com.taskmanager.taskmanager.model.Task;
import com.taskmanager.taskmanager.model.Task.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find tasks by status
    List<Task> findByStatus(Status status);

    // Find tasks by project
    List<Task> findByProjectId(Long projectId);

    // Find tasks by project and status
    List<Task> findByProjectIdAndStatus(Long projectId, Status status);

    // (Optional) Add custom query for sorting/filtering if needed
}
