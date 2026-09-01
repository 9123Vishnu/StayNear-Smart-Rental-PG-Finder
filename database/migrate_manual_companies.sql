USE staynear;

-- Manual company tagging does not require workplace coordinates.
ALTER TABLE companies MODIFY COLUMN latitude DECIMAL(10,7) NULL;
ALTER TABLE companies MODIFY COLUMN longitude DECIMAL(10,7) NULL;
ALTER TABLE property_companies MODIFY COLUMN distance_km DECIMAL(10,3) NULL;
