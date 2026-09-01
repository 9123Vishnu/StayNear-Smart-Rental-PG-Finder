package com.rental.project.service;
import com.rental.project.dto.*;
import com.rental.project.entity.*;
import com.rental.project.repository.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PropertyService {
 private final PropertyRepository properties; private final UserRepository users;
 private final CompanyRepository companies; private final PropertyCompanyRepository tags;
 private final DistanceService distance;

 public PropertyService(PropertyRepository p,UserRepository u,CompanyRepository c,PropertyCompanyRepository t,DistanceService d){
  properties=p;users=u;companies=c;tags=t;distance=d;
 }

 public Property create(PropertyRequest r){
  User owner=users.findById(r.getOwnerId()).orElseThrow(()->new IllegalArgumentException("Owner not found"));
  if(owner.getUserType()!=UserType.OWNER) throw new IllegalArgumentException("Only owners can create properties");
  return properties.save(Property.builder().owner(owner).name(r.getName()).address(r.getAddress())
   .rent(r.getRent()).propertyType(r.getPropertyType()).latitude(r.getLatitude()).longitude(r.getLongitude())
   .available(r.getAvailable()==null||r.getAvailable()).description(r.getDescription()).build());
 }

 public Property update(Long id,PropertyRequest r){
  Property p=properties.findById(id).orElseThrow(()->new IllegalArgumentException("Property not found"));
  p.setName(r.getName());p.setAddress(r.getAddress());p.setRent(r.getRent());p.setPropertyType(r.getPropertyType());
  p.setLatitude(r.getLatitude());p.setLongitude(r.getLongitude());p.setDescription(r.getDescription());
  if(r.getAvailable()!=null)p.setAvailable(r.getAvailable());
  Property saved=properties.save(p);

  // Keep workplace-tag distances in sync when an owner moves a property.
  for(PropertyCompany pc:tags.findByPropertyId(id)){
   Company c = pc.getCompany();
   Double d = null;
   if (saved.getLatitude() != null && saved.getLongitude() != null && c.getLatitude() != null && c.getLongitude() != null) {
    d = Math.round(distance.km(saved.getLatitude(), saved.getLongitude(), c.getLatitude(), c.getLongitude()) * 1000.0) / 1000.0;
   }
   pc.setDistanceKm(d);
   tags.save(pc);
  }
  return saved;
 }

 public void delete(Long id){properties.deleteById(id);}

 public List<PropertyResponse> nearby(Long companyId,double radiusKm,Double maxRent,String type,String sortBy){
  companies.findById(companyId).orElseThrow(()->new IllegalArgumentException("Company not found"));
  List<PropertyResponse> result=new ArrayList<>();
  for(PropertyCompany pc : tags.findByCompanyIdOrderByDistanceKmAsc(companyId)){
   Property p=pc.getProperty();
   if(!Boolean.TRUE.equals(p.getAvailable())) continue;
   if(maxRent!=null&&p.getRent()>maxRent) continue;
   if(type!=null&&!type.isBlank()&&!p.getPropertyType().equalsIgnoreCase(type)) continue;
   result.add(toResponse(p,pc.getDistanceKm()));
  }
  if("rent".equalsIgnoreCase(sortBy)) result.sort(Comparator.comparing(PropertyResponse::getRent));
  else result.sort(Comparator.comparing(PropertyResponse::getDistanceKm, Comparator.nullsLast(Double::compareTo)));
  return result;
 }

 public PropertyResponse get(Long id){
  Property p=properties.findById(id).orElseThrow(()->new IllegalArgumentException("Property not found"));
  return toResponse(p,null);
 }

 public List<PropertyResponse> ownerProperties(Long ownerId){
  return properties.findByOwnerId(ownerId).stream().map(p->toResponse(p,null)).collect(Collectors.toList());
 }

 public void tag(Long propertyId,Long companyId){
  Property p=properties.findById(propertyId).orElseThrow(()->new IllegalArgumentException("Property not found"));
  Company c=companies.findById(companyId).orElseThrow(()->new IllegalArgumentException("Company not found"));
  Double d = null;
  if (p.getLatitude() != null && p.getLongitude() != null && c.getLatitude() != null && c.getLongitude() != null) {
   d = Math.round(distance.km(p.getLatitude(), p.getLongitude(), c.getLatitude(), c.getLongitude()) * 1000.0) / 1000.0;
  }
  PropertyCompany pc=tags.findByPropertyIdAndCompanyId(propertyId,companyId)
    .orElse(PropertyCompany.builder().property(p).company(c).build());
  pc.setDistanceKm(d); tags.save(pc);
 }

 public void untag(Long propertyId,Long companyId){
  tags.findByPropertyIdAndCompanyId(propertyId,companyId).ifPresent(tags::delete);
 }

 public List<TaggedCompanyResponse> nearbyCompanies(Long propertyId,double radiusKm){
  properties.findById(propertyId).orElseThrow(()->new IllegalArgumentException("Property not found"));
  return companies.findAll().stream()
   .map(c -> {
    Double d = null;
    return toCompanyResponse(c, d);
   })
   .sorted(Comparator.comparing(TaggedCompanyResponse::getName, String.CASE_INSENSITIVE_ORDER))
   .collect(Collectors.toList());
 }

 public List<TaggedCompanyResponse> taggedCompanies(Long propertyId){
  properties.findById(propertyId).orElseThrow(()->new IllegalArgumentException("Property not found"));
  return tags.findByPropertyId(propertyId).stream()
   .sorted(Comparator.comparing(PropertyCompany::getDistanceKm, Comparator.nullsLast(Double::compareTo)))
   .map(pc -> toCompanyResponse(pc.getCompany(), pc.getDistanceKm()))
   .collect(Collectors.toList());
 }

 private TaggedCompanyResponse toCompanyResponse(Company c, Double d){
  Double rounded = d == null ? null : Math.round(d * 1000.0) / 1000.0;
  return new TaggedCompanyResponse(c.getId(), c.getName(), c.getAddress(), c.getLatitude(), c.getLongitude(), rounded);
 }

 private PropertyResponse toResponse(Property p,Double d){
  return new PropertyResponse(p.getId(),p.getName(),p.getAddress(),p.getPropertyType(),p.getDescription(),
   p.getRent(),p.getLatitude(),p.getLongitude(),d,p.getAvailable(),p.getOwner().getId(),p.getOwner().getName());
 }
}
