package com.rental.project.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table(name="companies")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Company {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false)
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
}
