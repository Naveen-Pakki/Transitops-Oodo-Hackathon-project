package com.transitops.controller;

import com.transitops.dto.ExpenseDTO;
import com.transitops.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'FINANCIAL_ANALYST', 'DISPATCHER', 'SAFETY_OFFICER')")
    public ResponseEntity<List<ExpenseDTO>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @GetMapping("/total")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'FINANCIAL_ANALYST', 'DISPATCHER', 'SAFETY_OFFICER')")
    public ResponseEntity<Map<String, BigDecimal>> getOperationalCost() {
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("operationalCost", expenseService.getOperationalCost());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'FINANCIAL_ANALYST', 'DISPATCHER', 'SAFETY_OFFICER')")
    public ResponseEntity<ExpenseDTO> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'FINANCIAL_ANALYST')")
    public ResponseEntity<ExpenseDTO> createExpense(@Valid @RequestBody ExpenseDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpense(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'FINANCIAL_ANALYST')")
    public ResponseEntity<ExpenseDTO> updateExpense(@PathVariable Long id, @Valid @RequestBody ExpenseDTO dto) {
        return ResponseEntity.ok(expenseService.updateExpense(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'FINANCIAL_ANALYST')")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
