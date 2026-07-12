package com.transitops.service.impl;

import com.transitops.dto.VehicleDTO;
import com.transitops.entity.Vehicle;
import com.transitops.repository.VehicleRepository;
import com.transitops.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleServiceImpl implements VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Override
    public List<VehicleDTO> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleDTO getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + id));
        return convertToDTO(vehicle);
    }

    @Override
    @Transactional
    public VehicleDTO createVehicle(VehicleDTO vehicleDTO) {
        if (vehicleRepository.existsByRegistrationNumber(vehicleDTO.getRegistrationNumber())) {
            throw new RuntimeException("Registration number '" + vehicleDTO.getRegistrationNumber() + "' is already in use");
        }
        Vehicle vehicle = convertToEntity(vehicleDTO);
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return convertToDTO(savedVehicle);
    }

    @Override
    @Transactional
    public VehicleDTO updateVehicle(Long id, VehicleDTO vehicleDTO) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + id));

        // Check if registration number changed and is already taken
        if (!vehicle.getRegistrationNumber().equalsIgnoreCase(vehicleDTO.getRegistrationNumber())) {
            if (vehicleRepository.existsByRegistrationNumber(vehicleDTO.getRegistrationNumber())) {
                throw new RuntimeException("Registration number '" + vehicleDTO.getRegistrationNumber() + "' is already in use");
            }
        }

        vehicle.setRegistrationNumber(vehicleDTO.getRegistrationNumber());
        vehicle.setModel(vehicleDTO.getModel());
        vehicle.setCapacity(vehicleDTO.getCapacity());
        vehicle.setOdometer(vehicleDTO.getOdometer());
        vehicle.setPurchaseCost(vehicleDTO.getPurchaseCost());
        vehicle.setStatus(vehicleDTO.getStatus());

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return convertToDTO(updatedVehicle);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + id));
        vehicleRepository.delete(vehicle);
    }

    private VehicleDTO convertToDTO(Vehicle vehicle) {
        VehicleDTO dto = new VehicleDTO();
        dto.setId(vehicle.getId());
        dto.setRegistrationNumber(vehicle.getRegistrationNumber());
        dto.setModel(vehicle.getModel());
        dto.setCapacity(vehicle.getCapacity());
        dto.setOdometer(vehicle.getOdometer());
        dto.setPurchaseCost(vehicle.getPurchaseCost());
        dto.setStatus(vehicle.getStatus());
        return dto;
    }

    private Vehicle convertToEntity(VehicleDTO dto) {
        Vehicle vehicle = new Vehicle();
        vehicle.setId(dto.getId());
        vehicle.setRegistrationNumber(dto.getRegistrationNumber());
        vehicle.setModel(dto.getModel());
        vehicle.setCapacity(dto.getCapacity());
        vehicle.setOdometer(dto.getOdometer());
        vehicle.setPurchaseCost(dto.getPurchaseCost());
        vehicle.setStatus(dto.getStatus());
        return vehicle;
    }
}
