package com.workout.tracker.service;

import com.workout.tracker.controller.workout.ExerciseRequest;
import com.workout.tracker.entity.Account;
import com.workout.tracker.entity.Exercise;
import com.workout.tracker.repository.AccountRepository;
import com.workout.tracker.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final AccountRepository accountRepository;

    public List<Exercise> getAllExercisesForUser(String userEmail) {
        Account user = accountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return exerciseRepository.findAllGlobalOrByUserId(user.getId());
    }

    public Exercise createCustomExercise(ExerciseRequest request, String userEmail) {
        Account user = accountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Exercise exercise = Exercise.builder()
                .name(request.getName())
                .description(request.getDescription())
                .muscleGroup(request.getMuscleGroup())
                .user(user)
                .build();

        return exerciseRepository.save(exercise);
    }

    public void deleteCustomExercise(Long exerciseId, String userEmail) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        // Check if it's a global exercise (user is null)
        if (exercise.getUser() == null) {
            throw new RuntimeException("Cannot delete global system exercises");
        }

        // Check ownership
        if (!exercise.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You are not authorized to delete this exercise");
        }

        exerciseRepository.delete(exercise);
    }
}
