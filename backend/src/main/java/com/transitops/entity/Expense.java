package com.transitops.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = true)
    private Vehicle vehicle;

    @Column(nullable = false, length = 50)
    private String category; // MAINTENANCE, FUEL, OTHER

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate date;

    @Column(length = 255)
    private String description;

    @Column(name = "reference_id", nullable = true)
    private Long referenceId; // links to MaintenanceLog ID or FuelLog ID
}
