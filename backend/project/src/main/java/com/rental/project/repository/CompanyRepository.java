package com.rental.project.repository;
import com.rental.project.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface CompanyRepository extends JpaRepository<Company,Long>{
    Optional<Company> findByNameIgnoreCase(String name);
}
