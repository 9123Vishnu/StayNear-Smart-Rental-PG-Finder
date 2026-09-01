package com.rental.project.repository;
import com.rental.project.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User,Long>{
 Optional<User> findByNameAndUserType(String name,UserType userType);
 boolean existsByEmail(String email);
}
