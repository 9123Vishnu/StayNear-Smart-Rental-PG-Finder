package com.rental.project.dto;

import com.rental.project.entity.*;
import lombok.*;

@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor
public class SignupRequest {
    private String name,email,phoneNumber,password;
    private Gender gender;
    private UserType userType;
}
