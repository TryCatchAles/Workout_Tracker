package com.workout.tracker.service;

import com.workout.tracker.controller.workout.WorkoutRequest;
import com.workout.tracker.entity.Account;
import com.workout.tracker.entity.Exercise;
import com.workout.tracker.entity.Workout;
import com.workout.tracker.entity.WorkoutExercise;
import com.workout.tracker.repository.AccountRepository;
import com.workout.tracker.repository.ExerciseRepository;
import com.workout.tracker.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;
    private final AccountRepository accountRepository;

    public void createWorkout(WorkoutRequest request, String userEmail) {
        Account user = accountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Workout workout = Workout.builder()
                .name(request.getName())
                .date(LocalDateTime.now())
                .user(user)
                .exercises(new ArrayList<>())
                .build();

        if (request.getExercises() != null) {
            for (WorkoutRequest.ExerciseRequest exRequest : request.getExercises()) {
                Exercise exercise = exerciseRepository.findById(exRequest.getExerciseId())
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));

                WorkoutExercise workoutExercise = WorkoutExercise.builder()
                        .workout(workout)
                        .exercise(exercise)
                        .sets(exRequest.getSets())
                        .reps(exRequest.getReps())
                        .weight(exRequest.getWeight())
                        .orderIndex(exRequest.getOrderIndex())
                        .build();


                //Necessary because of the CascadeType.ALL in the WorkoutEntity class
                //This makes sure that when we save the workout it actually saves the
                //exercises too. If it wasn't present we would only save the workout title/date
                workout.getExercises().add(workoutExercise);
            }
        }

        workoutRepository.save(workout);
    }

    public List<Workout> getWorkoutsForUser(String userEmail) {
        Account user = accountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return workoutRepository.findAllByUserId(user.getId());
    }

    public void deleteWorkout(String userEmail, Long workoutId) {
        //Finding the workout
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        //Checking if the workout is indeed the user's workout
        if (!workout.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You are not authorized to delete this workout");
        }

        //Deleting the workout from the database
        workoutRepository.delete(workout);
    }

    public void updateWorkout(WorkoutRequest request, String userEmail, Long workoutId) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        //Checking if the workout is indeed the user's workout
        if (!workout.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You are not authorized to update this workout");
        }

        //Updating workout name
        workout.setName(request.getName());

        //Update Exercises, first clear them
        workout.getExercises().clear();

        //Add new exercises
        if (request.getExercises() != null) {
            for (WorkoutRequest.ExerciseRequest exRequest : request.getExercises()) {

                //This looks for the exercise inside the exRequest
                Exercise exercise = exerciseRepository.findById(exRequest.getExerciseId())
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));


                //Builds the workout exercise from the specific exRequest that is ran in the for loop
                WorkoutExercise workoutExercise = WorkoutExercise.builder()
                        .workout(workout)
                        .exercise(exercise)
                        .sets(exRequest.getSets())
                        .reps(exRequest.getReps())
                        .weight(exRequest.getWeight())
                        .orderIndex(exRequest.getOrderIndex())
                        .build();

                workout.getExercises().add(workoutExercise);
            }
        }
        //Saves the updated workout in the database
        workoutRepository.save(workout);
    }

}