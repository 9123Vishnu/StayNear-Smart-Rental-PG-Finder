package com.rental.project.dto;

import com.rental.project.entity.UserType;
import lombok.*;
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor
public class AuthResponse { 
    private Long userId; 
    private String name; 
    private UserType userType; 
    private String message; 
}
