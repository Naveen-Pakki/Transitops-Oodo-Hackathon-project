package com.transitops.service;

import com.transitops.dto.MaintenanceLogDTO;
import java.util.List;

public interface MaintenanceLogService {
    List<MaintenanceLogDTO> getAllLogs();
    MaintenanceLogDTO getLogById(Long id);
    MaintenanceLogDTO createLog(MaintenanceLogDTO maintenanceLogDTO);
    MaintenanceLogDTO updateLog(Long id, MaintenanceLogDTO maintenanceLogDTO);
    void deleteLog(Long id);
}
