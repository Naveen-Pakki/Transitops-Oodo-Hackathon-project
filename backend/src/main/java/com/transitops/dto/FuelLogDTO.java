package com.transitops.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FuelLogDTO {
    private Long id;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    private String vehicleRegistration;
    private String vehicleModel;

    @NotNull(message = "Fuel date is required")
    private LocalDate date;

    @NotNull(message = "Liters count is required")
    @Min(value = 1, message = "Liters pumped must be at least 1")
    private Double liters;

    @NotNull(message = "Fuel cost is required")
    @DecimalMin(value = "0.0", message = "Fuel cost cannot be negative")
    private BigDecimal cost;

    @NotNull(message = "Mileage odometer is required")
    @Min(value = 0, message = "Mileage reading cannot be negative")
    private Double mileage;

    private Double fuelEfficiency;
}
