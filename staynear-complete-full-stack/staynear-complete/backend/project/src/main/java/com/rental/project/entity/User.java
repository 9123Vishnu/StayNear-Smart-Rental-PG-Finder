package com.rental.project.entity;

import jakarta.persistence.*;
import com.rental.project.entity.Gender;
import com.rental.project.entity.UserType;
import lombok.*;

@Entity 
@Table(name="users")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class User {
    @Id 
    @GeneratedValue(strategy=GenerationType.IDENTITY) 
    private Long id;
    @Column(nullable=false,length=100) 
    private String name;
    @Column(nullable=false,unique=true,length=100) 
    private String email;
    private String phoneNumber;
    @Enumerated(EnumType.STRING) 
    private Gender gender;
    @Enumerated(EnumType.STRING) 
    @Column(nullable=false) 
    private UserType userType;
    @Column(nullable=false) 
    private String password;
}
