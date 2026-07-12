package com.transitops.service;

import com.transitops.dto.ExpenseDTO;
import java.math.BigDecimal;
import java.util.List;

public interface ExpenseService {
    List<ExpenseDTO> getAllExpenses();
    ExpenseDTO getExpenseById(Long id);
    ExpenseDTO createExpense(ExpenseDTO expenseDTO);
    ExpenseDTO updateExpense(Long id, ExpenseDTO expenseDTO);
    void deleteExpense(Long id);
    BigDecimal getOperationalCost();
}
