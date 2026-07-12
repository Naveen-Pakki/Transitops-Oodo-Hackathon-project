package com.transitops.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TripDTO {
    private Long id;

    @NotBlank(message = "Source is required")
    private String source;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Vehicle selection is required")
    private Long vehicleId;

    private String vehicleRegistration;
    private String vehicleModel;

    @NotNull(message = "Driver selection is required")
    private Long driverId;

    private String driverName;

    @NotNull(message = "Cargo weight is required")
    @Min(value = 1, message = "Cargo weight must be greater than 0")
    private Double cargoWeight;

    @NotNull(message = "Distance is required")
    @Min(value = 1, message = "Distance must be greater than 0")
    private Double distance;

    private String status = "DRAFT"; // DRAFT, DISPATCHED, COMPLETED, CANCELLED

    private LocalDateTime dispatchDate;
    private LocalDateTime completionDate;
    private LocalDateTime createdAt;
}
