package com.transitops.service;

import com.transitops.dto.FuelLogDTO;
import java.util.List;

public interface FuelLogService {
    List<FuelLogDTO> getAllLogs();
    FuelLogDTO getLogById(Long id);
    FuelLogDTO createLog(FuelLogDTO fuelLogDTO);
    FuelLogDTO updateLog(Long id, FuelLogDTO fuelLogDTO);
    void deleteLog(Long id);
}
