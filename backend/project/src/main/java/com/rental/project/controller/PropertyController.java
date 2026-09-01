package com.rental.project.controller;

import com.rental.project.dto.*;
import com.rental.project.entity.*;
import com.rental.project.service.PropertyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController 
@RequestMapping("/api/properties") 
@CrossOrigin(origins="http://localhost:5173")
public class PropertyController {
    private final PropertyService service;
    public PropertyController(PropertyService service){
        this.service=service;
    }
    @PostMapping 
    public Property create(@RequestBody PropertyRequest r){
        return service.create(r);
    }
    @PutMapping("/{id}") 
    public Property update(@PathVariable Long id,@RequestBody PropertyRequest r){
        return service.update(id,r);
    }
    @DeleteMapping("/{id}") 
    public ResponseEntity<Void> delete(@PathVariable Long id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{id}") 
    public PropertyResponse get(@PathVariable Long id){
        return service.get(id);
    }
    @GetMapping("/owner/{ownerId}") 
    public List<PropertyResponse> owner(@PathVariable Long ownerId){
        return service.ownerProperties(ownerId);
    }
    @GetMapping("/nearby") 
    public List<PropertyResponse> nearby(@RequestParam Long companyId,@RequestParam(defaultValue="5") double radiusKm, @RequestParam(required=false) Double maxRent,@RequestParam(required=false) String propertyType,@RequestParam(defaultValue="distance") String sortBy){
        return service.nearby(companyId,radiusKm,maxRent,propertyType,sortBy);
    }
    @GetMapping("/{propertyId}/nearby-companies")
    public List<TaggedCompanyResponse> nearbyCompanies(@PathVariable Long propertyId,@RequestParam(defaultValue="10") double radiusKm){
        return service.nearbyCompanies(propertyId,radiusKm);
    }

    @GetMapping("/{propertyId}/companies")
    public List<TaggedCompanyResponse> taggedCompanies(@PathVariable Long propertyId){
        return service.taggedCompanies(propertyId);
    }
    @PostMapping("/{propertyId}/companies") 
    public ResponseEntity<Void> tag(@PathVariable Long propertyId,@RequestBody TagCompanyRequest r){
        service.tag(propertyId,r.getCompanyId());return ResponseEntity.ok().build();
    }
    @DeleteMapping("/{propertyId}/companies/{companyId}") 
    public ResponseEntity<Void> untag(@PathVariable Long propertyId,@PathVariable Long companyId){
        service.untag(propertyId,companyId);
        return ResponseEntity.noContent().build();
    }
}
