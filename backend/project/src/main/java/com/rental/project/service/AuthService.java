package com.rental.project.service;
import com.rental.project.dto.*;
import com.rental.project.entity.User;
import com.rental.project.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
@Service
public class AuthService {
 private final UserRepository users; 
 private final PasswordEncoder encoder;
 public AuthService(UserRepository users,PasswordEncoder encoder){
    this.users=users;this.encoder=encoder;
}
 public AuthResponse signup(SignupRequest r){
  if(users.existsByEmail(r.getEmail())) 
    throw new IllegalArgumentException("Email already registered");
  User u=User.builder().name(r.getName()).email(r.getEmail()).phoneNumber(r.getPhoneNumber())
   .gender(r.getGender()).userType(r.getUserType()).password(encoder.encode(r.getPassword())).build();
  u=users.save(u); return new AuthResponse(u.getId(),u.getName(),u.getUserType(),"Signup successful");
 }
 public AuthResponse login(LoginRequest r){
  User u=users.findByNameAndUserType(r.getName(),r.getUserType())
   .orElseThrow(()->new IllegalArgumentException("Invalid credentials"));
  if(!encoder.matches(r.getPassword(),u.getPassword())) throw new IllegalArgumentException("Invalid credentials");
  return new AuthResponse(u.getId(),u.getName(),u.getUserType(),"Login successful");
 }
}
