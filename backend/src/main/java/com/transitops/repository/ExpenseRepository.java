package com.transitops.repository;

import com.transitops.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByVehicleId(Long vehicleId);
    List<Expense> findByCategory(String category);
    Optional<Expense> findByCategoryAndReferenceId(String category, Long referenceId);
    void deleteByCategoryAndReferenceId(String category, Long referenceId);
}
