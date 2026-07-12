package com.transitops.repository;

import com.transitops.entity.FuelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FuelLogRepository extends JpaRepository<FuelLog, Long> {
    List<FuelLog> findByVehicleId(Long vehicleId);
    Optional<FuelLog> findFirstByVehicleIdAndMileageLessThanOrderByMileageDesc(Long vehicleId, Double mileage);
    Optional<FuelLog> findFirstByVehicleIdOrderByMileageDesc(Long vehicleId);
}
