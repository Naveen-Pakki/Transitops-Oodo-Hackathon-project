package com.transitops.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DriverDTO {
    private Long id;

    @NotBlank(message = "Driver name is required")
    private String name;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotNull(message = "License expiry date is required")
    private LocalDate licenseExpiry;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @DecimalMin(value = "0.0", message = "Safety score cannot be less than 0")
    @DecimalMax(value = "100.0", message = "Safety score cannot exceed 100")
    private Double safetyScore = 100.0;

    @NotBlank(message = "Status is required")
    private String status = "AVAILABLE";
}
