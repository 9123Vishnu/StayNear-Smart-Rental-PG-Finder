package com.rental.project.repository;
import com.rental.project.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PropertyRepository extends JpaRepository<Property,Long>{
 List<Property> findByOwnerId(Long ownerId);
}
