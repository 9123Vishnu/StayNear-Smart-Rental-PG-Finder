# StayNear — Complete MVP

A full-stack rental discovery platform:
- Tenants search rentals near their company.
- Owners add properties and tag multiple nearby companies.
- Distances are calculated from latitude/longitude using the Haversine formula.
- Tenant results can be filtered and sorted by distance/rent.
- Owner and tenant authentication with BCrypt passwords.
- Responsive React UI.

## Stack
React.js + Vite | Java + Spring Boot | REST API | MySQL | Spring Data JPA | Spring Security | BCrypt

## Backend
Update `backend/src/main/resources/application.properties`.
Run:
`cd backend`
`mvn spring-boot:run`

## Frontend
Run:
`cd frontend`
`npm install`
`npm run dev`

Frontend: http://localhost:5173
Backend: http://localhost:8080

## API
POST /api/auth/signup
POST /api/auth/login

GET /api/companies
POST /api/companies

POST /api/properties
GET /api/properties/nearby?companyId=1&radiusKm=5&maxRent=20000&propertyType=2BHK&sortBy=distance
GET /api/properties/owner/{ownerId}
GET /api/properties/{id}
PUT /api/properties/{id}
DELETE /api/properties/{id}

POST /api/properties/{propertyId}/companies
DELETE /api/properties/{propertyId}/companies/{companyId}

## Demo company data
Insert companies with latitude/longitude. Example:
Google Hyderabad: 17.4483, 78.3915
Microsoft Hyderabad: 17.4490, 78.3805
Amazon Hyderabad: 17.4350, 78.3810

## Notes
The project includes the core MVP. JWT can be added as the next security hardening step. The current authentication API returns a user response after BCrypt verification.

## Owner multi-company tagging

The owner dashboard now supports complete multi-company tagging:

- Select multiple nearby companies while creating a property.
- Search companies and choose a 5 km, 10 km, or 25 km radius.
- See calculated workplace distance beside every company.
- Existing property tags are loaded from the database.
- Add or remove multiple company tags at any time from each listing.
- Tagged companies are stored in `property_companies` with the calculated distance.

### Run

1. Start MySQL and create/use the database configured in `backend/project/src/main/resources/application.properties`.
2. Start the Spring Boot backend from `backend/project` with Maven.
3. In `frontend`, run `npm install` if dependencies are not installed, then `npm run dev`.
4. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).


## Manual company tagging

Owners can now select multiple companies manually from the complete company list. Company coordinates are not required. Owners can also create a company directly from the Add Property form using only a company name and optional address; the new company is immediately selected for the property.

Tenant search is tag-based: a tenant selects a company and sees available properties that an owner explicitly tagged to that company. Coordinate-based company discovery/radius filtering is no longer required.

### Existing database
If you already have a `staynear` database, run `database/migrate_manual_companies.sql` once. The Spring Boot application uses `ddl-auto=update`, but the migration makes the intended nullable columns explicit.

### Manual company tagging database fix
The backend now automatically makes `companies.latitude`, `companies.longitude`, and `property_companies.distance_km` nullable at startup. This allows companies to be created manually without coordinates. The migration SQL is also available in `database/migrate_manual_companies.sql` for reference/manual execution.
