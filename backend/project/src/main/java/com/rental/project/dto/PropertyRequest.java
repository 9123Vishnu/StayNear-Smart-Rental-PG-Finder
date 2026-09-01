package com.rental.project.dto;
import lombok.*;
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor
public class PropertyRequest {
 private Long ownerId;
 private String name,address,propertyType,description;
 private Double rent,latitude,longitude;
 private Boolean available;
}
