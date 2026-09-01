package com.rental.project.repository;
import com.rental.project.entity.PropertyCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface PropertyCompanyRepository extends JpaRepository<PropertyCompany,Long>{
 List<PropertyCompany> findByCompanyIdOrderByDistanceKmAsc(Long companyId);
 Optional<PropertyCompany> findByPropertyIdAndCompanyId(Long propertyId,Long companyId);
 List<PropertyCompany> findByPropertyId(Long propertyId);
}
