package com.expense_splitter.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
public class Expense {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String description;

	@Column(nullable = false, precision = 15, scale = 2)
	private BigDecimal amount;

	@ManyToOne(optional = false)
	@JoinColumn(name = "paid_by_id")
	private Participant paidBy;

	@Column(nullable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	public Expense() {}

	public Expense(String description, BigDecimal amount, Participant paidBy) {
		this.description = description;
		this.amount = amount;
		this.paidBy = paidBy;
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }

	public BigDecimal getAmount() { return amount; }
	public void setAmount(BigDecimal amount) { this.amount = amount; }

	public Participant getPaidBy() { return paidBy; }
	public void setPaidBy(Participant paidBy) { this.paidBy = paidBy; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}


