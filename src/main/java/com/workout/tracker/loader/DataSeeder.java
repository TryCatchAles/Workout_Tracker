package com.workout.tracker.loader;

import com.workout.tracker.entity.Exercise;
import com.workout.tracker.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ExerciseRepository exerciseRepository;

    @Override
    public void run(String... args) throws Exception {
        if (exerciseRepository.count() == 0) {
            List<Exercise> exercises = Arrays.asList(

                    Exercise.builder().name("Push Up").description("Calisthenics exercise where you start in a high plank position and you lower your body to the floor by flexing your arms.").muscleGroup("Chest").build(),
                    Exercise.builder().name("Squat").description("Same as sitting down in an imaginary chair, keeping your chest up and back straight.").muscleGroup("Legs").build(),
                    Exercise.builder().name("Pull Up").description("Exercise where you hang from a bar and you pull your body up until your chin is above the bar.").muscleGroup("Back").build()
                    );

            exerciseRepository.saveAll(exercises);
            System.out.println("Default exercises added to database");
        }
    }
}
