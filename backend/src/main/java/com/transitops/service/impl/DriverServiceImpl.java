package com.transitops.service.impl;

import com.transitops.dto.DriverDTO;
import com.transitops.entity.Driver;
import com.transitops.repository.DriverRepository;
import com.transitops.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverServiceImpl implements DriverService {

    @Autowired
    private DriverRepository driverRepository;

    @Override
    public List<DriverDTO> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DriverDTO getDriverById(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + id));
        return convertToDTO(driver);
    }

    @Override
    @Transactional
    public DriverDTO createDriver(DriverDTO driverDTO) {
        if (driverRepository.existsByLicenseNumber(driverDTO.getLicenseNumber())) {
            throw new RuntimeException("License number '" + driverDTO.getLicenseNumber() + "' is already in use");
        }
        Driver driver = convertToEntity(driverDTO);
        Driver savedDriver = driverRepository.save(driver);
        return convertToDTO(savedDriver);
    }

    @Override
    @Transactional
    public DriverDTO updateDriver(Long id, DriverDTO driverDTO) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + id));

        // License uniqueness check if changed
        if (!driver.getLicenseNumber().equalsIgnoreCase(driverDTO.getLicenseNumber())) {
            if (driverRepository.existsByLicenseNumber(driverDTO.getLicenseNumber())) {
                throw new RuntimeException("License number '" + driverDTO.getLicenseNumber() + "' is already in use");
            }
        }

        driver.setName(driverDTO.getName());
        driver.setLicenseNumber(driverDTO.getLicenseNumber());
        driver.setLicenseExpiry(driverDTO.getLicenseExpiry());
        driver.setPhone(driverDTO.getPhone());
        driver.setSafetyScore(driverDTO.getSafetyScore());
        driver.setStatus(driverDTO.getStatus());

        Driver updatedDriver = driverRepository.save(driver);
        return convertToDTO(updatedDriver);
    }

    @Override
    @Transactional
    public void deleteDriver(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + id));
        driverRepository.delete(driver);
    }

    private DriverDTO convertToDTO(Driver driver) {
        DriverDTO dto = new DriverDTO();
        dto.setId(driver.getId());
        dto.setName(driver.getName());
        dto.setLicenseNumber(driver.getLicenseNumber());
        dto.setLicenseExpiry(driver.getLicenseExpiry());
        dto.setPhone(driver.getPhone());
        dto.setSafetyScore(driver.getSafetyScore());
        dto.setStatus(driver.getStatus());
        return dto;
    }

    private Driver convertToEntity(DriverDTO dto) {
        Driver driver = new Driver();
        driver.setId(dto.getId());
        driver.setName(dto.getName());
        driver.setLicenseNumber(dto.getLicenseNumber());
        driver.setLicenseExpiry(dto.getLicenseExpiry());
        driver.setPhone(dto.getPhone());
        driver.setSafetyScore(dto.getSafetyScore());
        driver.setStatus(dto.getStatus());
        return driver;
    }
}
