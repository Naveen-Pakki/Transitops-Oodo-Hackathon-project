package com.transitops.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaintenanceLogDTO {
    private Long id;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    private String vehicleRegistration;
    private String vehicleModel;

    @NotBlank(message = "Maintenance type is required")
    private String maintenanceType;

    @NotNull(message = "Service date is required")
    private LocalDate date;

    @NotNull(message = "Maintenance cost is required")
    @DecimalMin(value = "0.0", message = "Maintenance cost cannot be negative")
    private BigDecimal cost;

    private String notes;
}
