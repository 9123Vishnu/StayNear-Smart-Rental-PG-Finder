package com.rental.project.entity;

import com.rental.project.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table(name="properties")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Property {
    @Id 
    @GeneratedValue(strategy=GenerationType.IDENTITY) 
    private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) 
    @JoinColumn(name="owner_id") 
    private User owner;
    @Column(nullable=false) 
    private String name;
    private String address;
    @Column(nullable=false) 
    private Double rent;
    @Column(nullable=false) 
    private String propertyType;
    @Column(nullable=false) 
    private Double latitude;
    @Column(nullable=false) 
    private Double longitude;
    private Boolean available=true;
    @Column(columnDefinition="TEXT") 
    private String description;
}
