package com.transitops.service.impl;

import com.transitops.dto.FuelLogDTO;
import com.transitops.entity.Expense;
import com.transitops.entity.FuelLog;
import com.transitops.entity.Vehicle;
import com.transitops.repository.ExpenseRepository;
import com.transitops.repository.FuelLogRepository;
import com.transitops.repository.VehicleRepository;
import com.transitops.service.FuelLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FuelLogServiceImpl implements FuelLogService {

    @Autowired
    private FuelLogRepository fuelLogRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Override
    public List<FuelLogDTO> getAllLogs() {
        return fuelLogRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FuelLogDTO getLogById(Long id) {
        FuelLog log = fuelLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fuel log not found with ID: " + id));
        return convertToDTO(log);
    }

    @Override
    @Transactional
    public FuelLogDTO createLog(FuelLogDTO dto) {
        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + dto.getVehicleId()));

        Double efficiency = calculateEfficiency(vehicle, dto.getMileage(), dto.getLiters());

        FuelLog log = convertToEntity(dto);
        log.setVehicle(vehicle);
        log.setFuelEfficiency(efficiency);
        FuelLog savedLog = fuelLogRepository.save(log);

        // Update vehicle odometer if fuel log shows a higher mileage
        if (dto.getMileage() > vehicle.getOdometer()) {
            vehicle.setOdometer(dto.getMileage());
            vehicleRepository.save(vehicle);
        }

        // Auto-generate operational expense record
        Expense expense = Expense.builder()
                .vehicle(vehicle)
                .category("FUEL")
                .amount(savedLog.getCost())
                .date(savedLog.getDate())
                .description("Fuel Refill: " + savedLog.getLiters() + " Liters")
                .referenceId(savedLog.getId())
                .build();
        expenseRepository.save(expense);

        return convertToDTO(savedLog);
    }

    @Override
    @Transactional
    public FuelLogDTO updateLog(Long id, FuelLogDTO dto) {
        FuelLog log = fuelLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fuel log not found with ID: " + id));

        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + dto.getVehicleId()));

        Double efficiency = calculateEfficiency(vehicle, dto.getMileage(), dto.getLiters());

        log.setVehicle(vehicle);
        log.setDate(dto.getDate());
        log.setLiters(dto.getLiters());
        log.setCost(dto.getCost());
        log.setMileage(dto.getMileage());
        log.setFuelEfficiency(efficiency);

        FuelLog updatedLog = fuelLogRepository.save(log);

        // Update vehicle odometer if updated fuel log shows a higher mileage
        if (dto.getMileage() > vehicle.getOdometer()) {
            vehicle.setOdometer(dto.getMileage());
            vehicleRepository.save(vehicle);
        }

        // Update corresponding operational expense
        expenseRepository.findByCategoryAndReferenceId("FUEL", id).ifPresent(expense -> {
            expense.setVehicle(vehicle);
            expense.setAmount(updatedLog.getCost());
            expense.setDate(updatedLog.getDate());
            expense.setDescription("Fuel Refill: " + updatedLog.getLiters() + " Liters");
            expenseRepository.save(expense);
        });

        return convertToDTO(updatedLog);
    }

    @Override
    @Transactional
    public void deleteLog(Long id) {
        FuelLog log = fuelLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fuel log not found with ID: " + id));

        // Delete associated expense record
        expenseRepository.deleteByCategoryAndReferenceId("FUEL", id);

        fuelLogRepository.delete(log);
    }

    private Double calculateEfficiency(Vehicle vehicle, Double currentMileage, Double liters) {
        Double previousMileage = fuelLogRepository.findFirstByVehicleIdAndMileageLessThanOrderByMileageDesc(vehicle.getId(), currentMileage)
                .map(FuelLog::getMileage)
                .orElse(null);

        Double efficiency = 0.0;
        if (previousMileage != null) {
            Double distance = currentMileage - previousMileage;
            if (distance > 0) {
                efficiency = distance / liters;
            }
        } else {
            // Fallback to vehicle odometer check if no previous refuel log
            Double distance = currentMileage - vehicle.getOdometer();
            if (distance > 0) {
                efficiency = distance / liters;
            }
        }
        return efficiency;
    }

    private FuelLogDTO convertToDTO(FuelLog log) {
        FuelLogDTO dto = new FuelLogDTO();
        dto.setId(log.getId());
        dto.setVehicleId(log.getVehicle().getId());
        dto.setVehicleRegistration(log.getVehicle().getRegistrationNumber());
        dto.setVehicleModel(log.getVehicle().getModel());
        dto.setDate(log.getDate());
        dto.setLiters(log.getLiters());
        dto.setCost(log.getCost());
        dto.setMileage(log.getMileage());
        dto.setFuelEfficiency(log.getFuelEfficiency());
        return dto;
    }

    private FuelLog convertToEntity(FuelLogDTO dto) {
        FuelLog log = new FuelLog();
        log.setId(dto.getId());
        log.setDate(dto.getDate());
        log.setLiters(dto.getLiters());
        log.setCost(dto.getCost());
        log.setMileage(dto.getMileage());
        log.setFuelEfficiency(dto.getFuelEfficiency() != null ? dto.getFuelEfficiency() : 0.0);
        return log;
    }
}
