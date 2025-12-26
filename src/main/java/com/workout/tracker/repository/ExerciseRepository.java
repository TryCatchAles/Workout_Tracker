package com.workout.tracker.repository;

import com.workout.tracker.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    
    // Find all exercises that are either GLOBAL (user is null) OR belong to the specific user
    @Query("SELECT e FROM Exercise e WHERE e.user IS NULL OR e.user.id = :userId")
    List<Exercise> findAllGlobalOrByUserId(Long userId);
}
