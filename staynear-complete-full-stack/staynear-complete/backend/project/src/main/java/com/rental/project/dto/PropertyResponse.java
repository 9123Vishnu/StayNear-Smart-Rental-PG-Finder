package com.rental.project.dto;

import lombok.*;

@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor
public class PropertyResponse {
    private Long id; 
    private String name,address,propertyType,description;
    private Double rent,latitude,longitude,distanceKm; 
    private Boolean available;
    private Long ownerId; 
    private String ownerName;
}
