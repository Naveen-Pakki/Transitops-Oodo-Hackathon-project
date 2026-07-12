package com.transitops.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(name = "cargo_weight", nullable = false)
    private Double cargoWeight; // in kg

    @Column(nullable = false)
    private Double distance; // in km

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "DRAFT"; // DRAFT, DISPATCHED, COMPLETED, CANCELLED

    @Column(name = "dispatch_date")
    private LocalDateTime dispatchDate;

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
