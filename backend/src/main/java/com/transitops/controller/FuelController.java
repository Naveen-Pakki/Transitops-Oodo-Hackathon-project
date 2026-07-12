package com.transitops.controller;

import com.transitops.dto.FuelLogDTO;
import com.transitops.service.FuelLogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel")
public class FuelController {

    @Autowired
    private FuelLogService fuelLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'FINANCIAL_ANALYST', 'DISPATCHER', 'SAFETY_OFFICER')")
    public ResponseEntity<List<FuelLogDTO>> getAllLogs() {
        return ResponseEntity.ok(fuelLogService.getAllLogs());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'FINANCIAL_ANALYST', 'DISPATCHER', 'SAFETY_OFFICER')")
    public ResponseEntity<FuelLogDTO> getLogById(@PathVariable Long id) {
        return ResponseEntity.ok(fuelLogService.getLogById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'FINANCIAL_ANALYST')")
    public ResponseEntity<FuelLogDTO> createLog(@Valid @RequestBody FuelLogDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fuelLogService.createLog(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'FINANCIAL_ANALYST')")
    public ResponseEntity<FuelLogDTO> updateLog(@PathVariable Long id, @Valid @RequestBody FuelLogDTO dto) {
        return ResponseEntity.ok(fuelLogService.updateLog(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'FINANCIAL_ANALYST')")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        fuelLogService.deleteLog(id);
        return ResponseEntity.noContent().build();
    }
}
