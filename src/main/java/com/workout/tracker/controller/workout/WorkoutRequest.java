package com.workout.tracker.controller.workout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class WorkoutRequest {

    @NotBlank
    private String name;

    @Valid
    @NotEmpty
    private List<ExerciseRequest> exercises;


    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ExerciseRequest {
        private Long exerciseId;

        @NotNull
        @Min(1)
        private Integer sets;

        @NotNull
        @Min(1)
        private Integer reps;

        @PositiveOrZero
        private Double weight;

        private Integer orderIndex;
    }
}
