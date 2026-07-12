package com.transitops.service.impl;

import com.transitops.dto.ExpenseDTO;
import com.transitops.entity.Expense;
import com.transitops.entity.Vehicle;
import com.transitops.repository.ExpenseRepository;
import com.transitops.repository.VehicleRepository;
import com.transitops.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Override
    public List<ExpenseDTO> getAllExpenses() {
        return expenseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ExpenseDTO getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + id));
        return convertToDTO(expense);
    }

    @Override
    @Transactional
    public ExpenseDTO createExpense(ExpenseDTO dto) {
        Vehicle vehicle = null;
        if (dto.getVehicleId() != null) {
            vehicle = vehicleRepository.findById(dto.getVehicleId())
                    .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + dto.getVehicleId()));
        }

        // Force manual expenses to OTHER category to avoid mess
        if (!"OTHER".equalsIgnoreCase(dto.getCategory())) {
            throw new RuntimeException("Manual expenses must fall under the 'OTHER' category. Fuel and Maintenance costs are automatically synchronized from their logs.");
        }

        Expense expense = convertToEntity(dto);
        expense.setVehicle(vehicle);
        expense.setCategory("OTHER");
        expense.setReferenceId(null); // manual has no reference id

        Expense savedExpense = expenseRepository.save(expense);
        return convertToDTO(savedExpense);
    }

    @Override
    @Transactional
    public ExpenseDTO updateExpense(Long id, ExpenseDTO dto) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + id));

        // Protect linked maintenance and fuel expenses
        if (expense.getReferenceId() != null) {
            throw new RuntimeException("Cannot edit this expense directly. It is automatically linked to a " + expense.getCategory() + " log.");
        }

        Vehicle vehicle = null;
        if (dto.getVehicleId() != null) {
            vehicle = vehicleRepository.findById(dto.getVehicleId())
                    .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + dto.getVehicleId()));
        }

        expense.setVehicle(vehicle);
        expense.setAmount(dto.getAmount());
        expense.setDate(dto.getDate());
        expense.setDescription(dto.getDescription());
        // Category is locked as OTHER for manual logs

        Expense updatedExpense = expenseRepository.save(expense);
        return convertToDTO(updatedExpense);
    }

    @Override
    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + id));

        // Protect linked maintenance and fuel expenses
        if (expense.getReferenceId() != null) {
            throw new RuntimeException("Cannot delete this expense directly. It is automatically linked to a " + expense.getCategory() + " log.");
        }

        expenseRepository.delete(expense);
    }

    @Override
    public BigDecimal getOperationalCost() {
        return expenseRepository.findAll().stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private ExpenseDTO convertToDTO(Expense expense) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setCategory(expense.getCategory());
        dto.setAmount(expense.getAmount());
        dto.setDate(expense.getDate());
        dto.setDescription(expense.getDescription());
        dto.setReferenceId(expense.getReferenceId());
        
        if (expense.getVehicle() != null) {
            dto.setVehicleId(expense.getVehicle().getId());
            dto.setVehicleRegistration(expense.getVehicle().getRegistrationNumber());
            dto.setVehicleModel(expense.getVehicle().getModel());
        }
        return dto;
    }

    private Expense convertToEntity(ExpenseDTO dto) {
        Expense expense = new Expense();
        expense.setId(dto.getId());
        expense.setCategory(dto.getCategory());
        expense.setAmount(dto.getAmount());
        expense.setDate(dto.getDate());
        expense.setDescription(dto.getDescription());
        expense.setReferenceId(dto.getReferenceId());
        return expense;
    }
}
