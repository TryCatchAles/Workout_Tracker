package com.workout.tracker.repository;

import com.workout.tracker.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    // Custom method: Find all workouts for a specific user
    List<Workout> findAllByUserId(Long userId);
}
