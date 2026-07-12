package com.transitops.service;

import com.transitops.dto.TripDTO;
import java.util.List;

public interface TripService {
    List<TripDTO> getAllTrips();
    TripDTO getTripById(Long id);
    TripDTO createTrip(TripDTO tripDTO);
    TripDTO updateTrip(Long id, TripDTO tripDTO);
    TripDTO dispatchTrip(Long id);
    TripDTO completeTrip(Long id);
    TripDTO cancelTrip(Long id);
    void deleteTrip(Long id);
}
