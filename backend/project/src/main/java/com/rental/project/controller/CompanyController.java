package com.rental.project.controller;

import com.rental.project.entity.Company;
import com.rental.project.repository.CompanyRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins="http://localhost:5173")
public class CompanyController {
    private final CompanyRepository repo;
    public CompanyController(CompanyRepository repo){ this.repo=repo; }

    @GetMapping
    public List<Company> all(){
        return repo.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "name"));
    }

    @PostMapping
    public Company create(@RequestBody Company c){
        String name = c.getName() == null ? "" : c.getName().trim();
        if(name.isBlank()) throw new IllegalArgumentException("Company name is required");
        return repo.findByNameIgnoreCase(name).map(existing -> {
            if(c.getAddress() != null && !c.getAddress().isBlank()) existing.setAddress(c.getAddress().trim());
            return repo.save(existing);
        }).orElseGet(() -> {
            c.setName(name);
            return repo.save(c);
        });
    }
}
