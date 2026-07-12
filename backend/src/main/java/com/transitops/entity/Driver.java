package com.transitops.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "drivers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "license_number", nullable = false, unique = true, length = 50)
    private String licenseNumber;

    @Column(name = "license_expiry", nullable = false)
    private LocalDate licenseExpiry;

    @Column(nullable = false, length = 20)
    private String phone;

    @Builder.Default
    @Column(name = "safety_score")
    private Double safetyScore = 100.0;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE"; // AVAILABLE, ON_TRIP, INACTIVE
}
