package com.rental.project.dto;

import com.rental.project.entity.UserType;
import lombok.*;

@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor
public class LoginRequest { 
    private String name; 
    private UserType userType; 
    private String password; 
}
