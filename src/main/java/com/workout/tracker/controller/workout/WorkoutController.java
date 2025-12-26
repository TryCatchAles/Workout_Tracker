package com.workout.tracker.controller.workout;

import com.workout.tracker.entity.Workout;
import com.workout.tracker.service.WorkoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @PostMapping
    public ResponseEntity<String> createWorkout(@Valid @RequestBody WorkoutRequest request, Authentication authentication) {

        workoutService.createWorkout(request, authentication.getName());
        return ResponseEntity.ok("Workout created successfully");

    }

    @GetMapping
    public ResponseEntity<List<Workout>> getMyWorkouts(Authentication authentication) {
        return ResponseEntity.ok(workoutService.getWorkoutsForUser(authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteWorkout(@PathVariable Long id, Authentication authentication) {
        workoutService.deleteWorkout(authentication.getName(), id);
        return ResponseEntity.ok("Workout deleted successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateWorkout(@PathVariable Long id, @Valid @RequestBody WorkoutRequest request, Authentication authentication) {
        workoutService.updateWorkout(request, authentication.getName(),id);
        return ResponseEntity.ok("Workout updated successfully");
    }
}
