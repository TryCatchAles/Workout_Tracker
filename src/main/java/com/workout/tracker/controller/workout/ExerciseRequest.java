package com.workout.tracker.controller.workout;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExerciseRequest {
    @NotBlank
    private String name;
    private String description;
    private String muscleGroup;
}
