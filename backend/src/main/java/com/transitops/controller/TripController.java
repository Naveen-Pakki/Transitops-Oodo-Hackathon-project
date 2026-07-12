package com.transitops.controller;

import com.transitops.dto.TripDTO;
import com.transitops.service.TripService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripService tripService;

    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST')")
    public ResponseEntity<List<TripDTO>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST')")
    public ResponseEntity<TripDTO> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<TripDTO> createTrip(@Valid @RequestBody TripDTO tripDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.createTrip(tripDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<TripDTO> updateTrip(@PathVariable Long id, @Valid @RequestBody TripDTO tripDTO) {
        return ResponseEntity.ok(tripService.updateTrip(id, tripDTO));
    }

    @PutMapping("/{id}/dispatch")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<TripDTO> dispatchTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.dispatchTrip(id));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<TripDTO> completeTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.completeTrip(id));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<TripDTO> cancelTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.cancelTrip(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id) {
        tripService.deleteTrip(id);
        return ResponseEntity.noContent().build();
    }
}
