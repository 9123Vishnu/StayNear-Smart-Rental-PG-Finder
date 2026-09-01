package com.rental.project.controller;

import com.rental.project.dto.LoginRequest;
import com.rental.project.dto.SignupRequest;
import com.rental.project.dto.AuthResponse;
import com.rental.project.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController 
@RequestMapping("/api/auth") 
@CrossOrigin(origins="http://localhost:5173")
public class AuthController {
    private final AuthService service;
    public AuthController(AuthService service){
        this.service=service;
    }
    @PostMapping("/signup") 
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest r){
        return ResponseEntity.ok(service.signup(r));
    }
    @PostMapping("/login") 
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest r){
        return ResponseEntity.ok(service.login(r));
    }
}
