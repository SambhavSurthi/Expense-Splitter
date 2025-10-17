package com.expense_splitter.service;

import com.expense_splitter.entity.Participant;
import com.expense_splitter.repository.ParticipantRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParticipantService {
	private final ParticipantRepository participantRepository;

	public ParticipantService(ParticipantRepository participantRepository) {
		this.participantRepository = participantRepository;
	}

	public List<Participant> findAll() {
		return participantRepository.findAll();
	}

	public Participant create(Participant participant) {
		return participantRepository.save(participant);
	}

	public Participant update(Long id, Participant updated) {
		Participant existing = participantRepository.findById(id).orElseThrow();
		existing.setName(updated.getName());
		return participantRepository.save(existing);
	}

	public void delete(Long id) {
		participantRepository.deleteById(id);
	}
}


