package com.rental.project.config;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
    @Bean SecurityFilterChain securityFilterChain(HttpSecurity http)throws Exception{
    http.csrf(AbstractHttpConfigurer::disable).authorizeHttpRequests(a->a.anyRequest().permitAll());
    return http.build();
    }
}
