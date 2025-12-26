package com.workout.tracker.controller.workout;

import com.workout.tracker.entity.Exercise;
import com.workout.tracker.service.ExerciseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @GetMapping
    public ResponseEntity<List<Exercise>> getExercises(Authentication authentication) {
        return ResponseEntity.ok(exerciseService.getAllExercisesForUser(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<Exercise> createExercise(
            @Valid @RequestBody ExerciseRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(exerciseService.createCustomExercise(request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteExercise(
            @PathVariable Long id,
            Authentication authentication
    ) {
        exerciseService.deleteCustomExercise(id, authentication.getName());
        return ResponseEntity.ok("Exercise deleted successfully");
    }
}
