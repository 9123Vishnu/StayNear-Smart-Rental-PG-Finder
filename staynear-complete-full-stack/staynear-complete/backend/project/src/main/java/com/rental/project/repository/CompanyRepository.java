package com.rental.project.repository;
import com.rental.project.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CompanyRepository extends JpaRepository<Company,Long>{}
