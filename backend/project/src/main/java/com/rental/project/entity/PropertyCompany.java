package com.rental.project.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table(
    name = "property_companies", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"property_id", "company_id"})
)
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class PropertyCompany {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) 
    @JoinColumn(name = "property_id") 
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) 
    @JoinColumn(name = "company_id") 
    private Company company;

    private Double distanceKm;
}