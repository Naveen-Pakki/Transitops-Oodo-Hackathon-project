package com.transitops.controller;

import com.transitops.dto.DriverDTO;
import com.transitops.service.DriverService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST')")
    public ResponseEntity<List<DriverDTO>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST')")
    public ResponseEntity<DriverDTO> getDriverById(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER')")
    public ResponseEntity<DriverDTO> createDriver(@Valid @RequestBody DriverDTO driverDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(driverService.createDriver(driverDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER')")
    public ResponseEntity<DriverDTO> updateDriver(@PathVariable Long id, @Valid @RequestBody DriverDTO driverDTO) {
        return ResponseEntity.ok(driverService.updateDriver(id, driverDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER')")
    public ResponseEntity<Void> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.noContent().build();
    }
}
