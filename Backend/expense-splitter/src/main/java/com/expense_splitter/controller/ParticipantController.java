package com.expense_splitter.controller;

import com.expense_splitter.entity.Participant;
import com.expense_splitter.service.ParticipantService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participants")
@CrossOrigin("*")
public class ParticipantController {
	private final ParticipantService participantService;

	public ParticipantController(ParticipantService participantService) {
		this.participantService = participantService;
	}

	@GetMapping
	public List<Participant> all() { return participantService.findAll(); }

	@PostMapping
	public Participant create(@RequestBody Participant p) { return participantService.create(p); }

	@PutMapping("/{id}")
	public Participant update(@PathVariable Long id, @RequestBody Participant p) { return participantService.update(id, p); }

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) { participantService.delete(id); }
}


