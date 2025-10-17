package com.expense_splitter.controller;

import com.expense_splitter.entity.Expense;
import com.expense_splitter.service.ExpenseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin
public class ExpenseController {
	private final ExpenseService expenseService;

	public ExpenseController(ExpenseService expenseService) {
		this.expenseService = expenseService;
	}

	@GetMapping
	public List<Expense> all() { return expenseService.findAll(); }

	@PostMapping
	public Expense create(@RequestBody Expense e) { return expenseService.create(e); }

	@PutMapping("/{id}")
	public Expense update(@PathVariable Long id, @RequestBody Expense e) { return expenseService.update(id, e); }

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) { expenseService.delete(id); }

	@GetMapping("/summary")
	public Map<String, Object> summary() { return expenseService.getSummary(); }
}


