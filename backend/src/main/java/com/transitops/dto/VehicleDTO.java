package com.transitops.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VehicleDTO {
    private Long id;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "Vehicle model is required")
    private String model;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be greater than 0")
    private Double capacity;

    @NotNull(message = "Odometer reading is required")
    @Min(value = 0, message = "Odometer reading cannot be negative")
    private Double odometer;

    @NotNull(message = "Purchase cost is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Purchase cost cannot be negative")
    private BigDecimal purchaseCost;

    @NotBlank(message = "Status is required")
    private String status = "ACTIVE";
}
