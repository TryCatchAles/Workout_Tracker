package com.workout.tracker.repository;

import com.workout.tracker.entity.Exercise;
import com.workout.tracker.entity.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {
    // We usually don't need custom methods here yet,
    // because we access these through the Workout object.
}
