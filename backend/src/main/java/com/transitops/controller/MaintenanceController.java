package com.transitops.controller;

import com.transitops.dto.MaintenanceLogDTO;
import com.transitops.service.MaintenanceLogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@PreAuthorize("hasRole('FLEET_MANAGER')")
public class MaintenanceController {

    @Autowired
    private MaintenanceLogService maintenanceLogService;

    @GetMapping
    public ResponseEntity<List<MaintenanceLogDTO>> getAllLogs() {
        return ResponseEntity.ok(maintenanceLogService.getAllLogs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceLogDTO> getLogById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceLogService.getLogById(id));
    }

    @PostMapping
    public ResponseEntity<MaintenanceLogDTO> createLog(@Valid @RequestBody MaintenanceLogDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(maintenanceLogService.createLog(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceLogDTO> updateLog(@PathVariable Long id, @Valid @RequestBody MaintenanceLogDTO dto) {
        return ResponseEntity.ok(maintenanceLogService.updateLog(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        maintenanceLogService.deleteLog(id);
        return ResponseEntity.noContent().build();
    }
}
