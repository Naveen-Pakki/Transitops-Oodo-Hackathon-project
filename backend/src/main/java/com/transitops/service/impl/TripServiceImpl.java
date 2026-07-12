package com.transitops.service.impl;

import com.transitops.dto.TripDTO;
import com.transitops.entity.Driver;
import com.transitops.entity.Trip;
import com.transitops.entity.Vehicle;
import com.transitops.repository.DriverRepository;
import com.transitops.repository.TripRepository;
import com.transitops.repository.VehicleRepository;
import com.transitops.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripServiceImpl implements TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Override
    public List<TripDTO> getAllTrips() {
        return tripRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TripDTO getTripById(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + id));
        return convertToDTO(trip);
    }

    @Override
    @Transactional
    public TripDTO createTrip(TripDTO tripDTO) {
        Vehicle vehicle = vehicleRepository.findById(tripDTO.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + tripDTO.getVehicleId()));

        Driver driver = driverRepository.findById(tripDTO.getDriverId())
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + tripDTO.getDriverId()));

        validateTripParameters(vehicle, driver, tripDTO.getCargoWeight());

        Trip trip = convertToEntity(tripDTO);
        trip.setVehicle(vehicle);
        trip.setDriver(driver);
        trip.setStatus("DRAFT");

        Trip savedTrip = tripRepository.save(trip);
        return convertToDTO(savedTrip);
    }

    @Override
    @Transactional
    public TripDTO updateTrip(Long id, TripDTO tripDTO) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + id));

        if (!"DRAFT".equals(trip.getStatus())) {
            throw new RuntimeException("Only DRAFT trips can be updated. Current status: " + trip.getStatus());
        }

        Vehicle vehicle = vehicleRepository.findById(tripDTO.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + tripDTO.getVehicleId()));

        Driver driver = driverRepository.findById(tripDTO.getDriverId())
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + tripDTO.getDriverId()));

        validateTripParameters(vehicle, driver, tripDTO.getCargoWeight());

        trip.setSource(tripDTO.getSource());
        trip.setDestination(tripDTO.getDestination());
        trip.setVehicle(vehicle);
        trip.setDriver(driver);
        trip.setCargoWeight(tripDTO.getCargoWeight());
        trip.setDistance(tripDTO.getDistance());

        Trip updatedTrip = tripRepository.save(trip);
        return convertToDTO(updatedTrip);
    }

    @Override
    @Transactional
    public TripDTO dispatchTrip(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + id));

        if (!"DRAFT".equals(trip.getStatus())) {
            throw new RuntimeException("Only DRAFT trips can be dispatched. Current status: " + trip.getStatus());
        }

        Vehicle vehicle = trip.getVehicle();
        Driver driver = trip.getDriver();

        // 1. Vehicle availability checks
        if ("IN_SHOP".equals(vehicle.getStatus()) || "OUT_OF_SERVICE".equals(vehicle.getStatus())) {
            throw new RuntimeException("Vehicle " + vehicle.getRegistrationNumber() + " is currently " + vehicle.getStatus() + " and cannot be dispatched.");
        }
        if (tripRepository.existsByVehicleIdAndStatus(vehicle.getId(), "DISPATCHED")) {
            throw new RuntimeException("Vehicle " + vehicle.getRegistrationNumber() + " is already assigned to an ongoing dispatched trip.");
        }

        // 2. Driver availability & license validity checks
        if ("INACTIVE".equals(driver.getStatus())) {
            throw new RuntimeException("Driver " + driver.getName() + " is currently marked INACTIVE.");
        }
        if (driver.getLicenseExpiry().isBefore(LocalDate.now())) {
            throw new RuntimeException("Driver " + driver.getName() + " has an EXPIRED license. Cannot dispatch.");
        }
        if (tripRepository.existsByDriverIdAndStatus(driver.getId(), "DISPATCHED")) {
            throw new RuntimeException("Driver " + driver.getName() + " is already assigned to an ongoing dispatched trip.");
        }

        // 3. Perform dispatch state transition
        trip.setStatus("DISPATCHED");
        trip.setDispatchDate(LocalDateTime.now());

        driver.setStatus("ON_TRIP");
        vehicle.setStatus("ACTIVE");

        vehicleRepository.save(vehicle);
        driverRepository.save(driver);
        Trip savedTrip = tripRepository.save(trip);
        return convertToDTO(savedTrip);
    }

    @Override
    @Transactional
    public TripDTO completeTrip(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + id));

        if (!"DISPATCHED".equals(trip.getStatus())) {
            throw new RuntimeException("Only DISPATCHED trips can be completed.");
        }

        Vehicle vehicle = trip.getVehicle();
        Driver driver = trip.getDriver();

        // 1. Transition trip state
        trip.setStatus("COMPLETED");
        trip.setCompletionDate(LocalDateTime.now());

        // 2. Restore driver status
        driver.setStatus("AVAILABLE");

        // 3. Restore vehicle status and increment odometer
        vehicle.setOdometer(vehicle.getOdometer() + trip.getDistance());
        vehicle.setStatus("ACTIVE");

        vehicleRepository.save(vehicle);
        driverRepository.save(driver);
        Trip savedTrip = tripRepository.save(trip);
        return convertToDTO(savedTrip);
    }

    @Override
    @Transactional
    public TripDTO cancelTrip(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + id));

        if ("COMPLETED".equals(trip.getStatus()) || "CANCELLED".equals(trip.getStatus())) {
            throw new RuntimeException("Cannot cancel a trip that is already " + trip.getStatus());
        }

        Vehicle vehicle = trip.getVehicle();
        Driver driver = trip.getDriver();

        // If it was already dispatched, we release driver and vehicle
        if ("DISPATCHED".equals(trip.getStatus())) {
            driver.setStatus("AVAILABLE");
            vehicle.setStatus("ACTIVE");
            vehicleRepository.save(vehicle);
            driverRepository.save(driver);
        }

        trip.setStatus("CANCELLED");
        Trip savedTrip = tripRepository.save(trip);
        return convertToDTO(savedTrip);
    }

    @Override
    @Transactional
    public void deleteTrip(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + id));

        if ("DISPATCHED".equals(trip.getStatus())) {
            throw new RuntimeException("Cannot delete a trip while it is active (DISPATCHED). Cancel it first.");
        }

        tripRepository.delete(trip);
    }

    private void validateTripParameters(Vehicle vehicle, Driver driver, Double cargoWeight) {
        if (cargoWeight > vehicle.getCapacity()) {
            throw new RuntimeException("Cargo weight (" + cargoWeight + " kg) exceeds vehicle capacity limit (" + vehicle.getCapacity() + " kg)");
        }
        if (driver.getLicenseExpiry().isBefore(LocalDate.now())) {
            throw new RuntimeException("Driver " + driver.getName() + " has an expired license. Cannot assign to trip.");
        }
    }

    private TripDTO convertToDTO(Trip trip) {
        TripDTO dto = new TripDTO();
        dto.setId(trip.getId());
        dto.setSource(trip.getSource());
        dto.setDestination(trip.getDestination());
        dto.setVehicleId(trip.getVehicle().getId());
        dto.setVehicleRegistration(trip.getVehicle().getRegistrationNumber());
        dto.setVehicleModel(trip.getVehicle().getModel());
        dto.setDriverId(trip.getDriver().getId());
        dto.setDriverName(trip.getDriver().getName());
        dto.setCargoWeight(trip.getCargoWeight());
        dto.setDistance(trip.getDistance());
        dto.setStatus(trip.getStatus());
        dto.setDispatchDate(trip.getDispatchDate());
        dto.setCompletionDate(trip.getCompletionDate());
        dto.setCreatedAt(trip.getCreatedAt());
        return dto;
    }

    private Trip convertToEntity(TripDTO dto) {
        Trip trip = new Trip();
        trip.setId(dto.getId());
        trip.setSource(dto.getSource());
        trip.setDestination(dto.getDestination());
        trip.setCargoWeight(dto.getCargoWeight());
        trip.setDistance(dto.getDistance());
        trip.setStatus(dto.getStatus());
        trip.setDispatchDate(dto.getDispatchDate());
        trip.setCompletionDate(dto.getCompletionDate());
        return trip;
    }
}
