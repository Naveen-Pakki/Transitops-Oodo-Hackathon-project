package com.transitops.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseDTO {
    private Long id;

    private Long vehicleId;
    private String vehicleRegistration;
    private String vehicleModel;

    @NotBlank(message = "Category is required")
    private String category; // MAINTENANCE, FUEL, OTHER

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Expense amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Description is required")
    private String description;

    private Long referenceId; // links to MaintenanceLog ID or FuelLog ID
}
