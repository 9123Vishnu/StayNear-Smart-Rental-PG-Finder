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
    public CompanyController(CompanyRepository repo){
        this.repo=repo;
    }
    @GetMapping public List<Company> all(){
        return repo.findAll();
    }
    @PostMapping 
    public Company create(@RequestBody Company c){
        return repo.save(c);
    }
}
