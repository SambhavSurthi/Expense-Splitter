package com.expense_splitter.service;

import com.expense_splitter.entity.Expense;
import com.expense_splitter.entity.Participant;
import com.expense_splitter.repository.ExpenseRepository;
import com.expense_splitter.repository.ParticipantRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
public class ExpenseService {
	private final ExpenseRepository expenseRepository;
	private final ParticipantRepository participantRepository;

	public ExpenseService(ExpenseRepository expenseRepository, ParticipantRepository participantRepository) {
		this.expenseRepository = expenseRepository;
		this.participantRepository = participantRepository;
	}

	public List<Expense> findAll() { return expenseRepository.findAll(); }

	public Expense create(Expense expense) { return expenseRepository.save(expense); }

	public Expense update(Long id, Expense updated) {
		Expense existing = expenseRepository.findById(id).orElseThrow();
		existing.setDescription(updated.getDescription());
		existing.setAmount(updated.getAmount());
		existing.setPaidBy(updated.getPaidBy());
		return expenseRepository.save(existing);
	}

	public void delete(Long id) { expenseRepository.deleteById(id); }

	public Map<String, Object> getSummary() {
		List<Participant> participants = participantRepository.findAll();
		List<Expense> expenses = expenseRepository.findAll();

		BigDecimal total = expenses.stream()
			.map(Expense::getAmount)
			.reduce(BigDecimal.ZERO, BigDecimal::add);

		int count = Math.max(participants.size(), 1);
		BigDecimal equalShare = total.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);

		Map<String, BigDecimal> paidByUser = new HashMap<>();
		for (Participant p : participants) {
			paidByUser.put(p.getName(), BigDecimal.ZERO);
		}
		for (Expense e : expenses) {
			paidByUser.merge(e.getPaidBy().getName(), e.getAmount(), BigDecimal::add);
		}

		Map<String, BigDecimal> balance = new HashMap<>();
		for (Participant p : participants) {
			BigDecimal paid = paidByUser.getOrDefault(p.getName(), BigDecimal.ZERO);
			balance.put(p.getName(), paid.subtract(equalShare));
		}

		// Build settlements (who owes whom)
		class Node {
			String name; BigDecimal amount;
			Node(String n, BigDecimal a) { name = n; amount = a; }
		}
		List<Node> creditors = new ArrayList<>();
		List<Node> debtors = new ArrayList<>();
		for (Map.Entry<String, BigDecimal> entry : balance.entrySet()) {
			BigDecimal val = entry.getValue();
			if (val.compareTo(BigDecimal.ZERO) > 0) creditors.add(new Node(entry.getKey(), val));
			else if (val.compareTo(BigDecimal.ZERO) < 0) debtors.add(new Node(entry.getKey(), val.abs()));
		}
		List<Map<String, Object>> settlements = new ArrayList<>();
		int i = 0, j = 0;
		while (i < debtors.size() && j < creditors.size()) {
			Node d = debtors.get(i);
			Node c = creditors.get(j);
			BigDecimal pay = d.amount.min(c.amount).setScale(2, RoundingMode.HALF_UP);
			Map<String, Object> tr = new HashMap<>();
			tr.put("from", d.name);
			tr.put("to", c.name);
			tr.put("amount", pay);
			settlements.add(tr);
			d.amount = d.amount.subtract(pay);
			c.amount = c.amount.subtract(pay);
			if (d.amount.compareTo(BigDecimal.ZERO) == 0) i++;
			if (c.amount.compareTo(BigDecimal.ZERO) == 0) j++;
		}

		Map<String, Object> result = new HashMap<>();
		result.put("total", total);
		result.put("equalShare", equalShare);
		result.put("balance", balance);
		result.put("settlements", settlements);
		return result;
	}
}


