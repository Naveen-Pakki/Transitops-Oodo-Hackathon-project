package com.transitops.service.impl;

import com.transitops.dto.MaintenanceLogDTO;
import com.transitops.entity.Expense;
import com.transitops.entity.MaintenanceLog;
import com.transitops.entity.Vehicle;
import com.transitops.repository.ExpenseRepository;
import com.transitops.repository.MaintenanceLogRepository;
import com.transitops.repository.VehicleRepository;
import com.transitops.service.MaintenanceLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceLogServiceImpl implements MaintenanceLogService {

    @Autowired
    private MaintenanceLogRepository maintenanceLogRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Override
    public List<MaintenanceLogDTO> getAllLogs() {
        return maintenanceLogRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MaintenanceLogDTO getLogById(Long id) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance log not found with ID: " + id));
        return convertToDTO(log);
    }

    @Override
    @Transactional
    public MaintenanceLogDTO createLog(MaintenanceLogDTO dto) {
        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + dto.getVehicleId()));

        // Update vehicle status to IN_SHOP
        vehicle.setStatus("IN_SHOP");
        vehicleRepository.save(vehicle);

        MaintenanceLog log = convertToEntity(dto);
        log.setVehicle(vehicle);
        MaintenanceLog savedLog = maintenanceLogRepository.save(log);

        // Auto-generate operational expense record
        Expense expense = Expense.builder()
                .vehicle(vehicle)
                .category("MAINTENANCE")
                .amount(savedLog.getCost())
                .date(savedLog.getDate())
                .description("Maintenance Work: " + savedLog.getMaintenanceType())
                .referenceId(savedLog.getId())
                .build();
        expenseRepository.save(expense);

        return convertToDTO(savedLog);
    }

    @Override
    @Transactional
    public MaintenanceLogDTO updateLog(Long id, MaintenanceLogDTO dto) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance log not found with ID: " + id));

        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + dto.getVehicleId()));

        log.setVehicle(vehicle);
        log.setMaintenanceType(dto.getMaintenanceType());
        log.setDate(dto.getDate());
        log.setCost(dto.getCost());
        log.setNotes(dto.getNotes());

        MaintenanceLog updatedLog = maintenanceLogRepository.save(log);

        // Update corresponding operational expense
        expenseRepository.findByCategoryAndReferenceId("MAINTENANCE", id).ifPresent(expense -> {
            expense.setVehicle(vehicle);
            expense.setAmount(updatedLog.getCost());
            expense.setDate(updatedLog.getDate());
            expense.setDescription("Maintenance Work: " + updatedLog.getMaintenanceType());
            expenseRepository.save(expense);
        });

        return convertToDTO(updatedLog);
    }

    @Override
    @Transactional
    public void deleteLog(Long id) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance log not found with ID: " + id));

        // Restore vehicle to ACTIVE status when release/delete
        Vehicle vehicle = log.getVehicle();
        if ("IN_SHOP".equals(vehicle.getStatus())) {
            vehicle.setStatus("ACTIVE");
            vehicleRepository.save(vehicle);
        }

        // Delete associated expense record
        expenseRepository.deleteByCategoryAndReferenceId("MAINTENANCE", id);

        maintenanceLogRepository.delete(log);
    }

    private MaintenanceLogDTO convertToDTO(MaintenanceLog log) {
        MaintenanceLogDTO dto = new MaintenanceLogDTO();
        dto.setId(log.getId());
        dto.setVehicleId(log.getVehicle().getId());
        dto.setVehicleRegistration(log.getVehicle().getRegistrationNumber());
        dto.setVehicleModel(log.getVehicle().getModel());
        dto.setMaintenanceType(log.getMaintenanceType());
        dto.setDate(log.getDate());
        dto.setCost(log.getCost());
        dto.setNotes(log.getNotes());
        return dto;
    }

    private MaintenanceLog convertToEntity(MaintenanceLogDTO dto) {
        MaintenanceLog log = new MaintenanceLog();
        log.setId(dto.getId());
        log.setMaintenanceType(dto.getMaintenanceType());
        log.setDate(dto.getDate());
        log.setCost(dto.getCost());
        log.setNotes(dto.getNotes());
        return log;
    }
}
