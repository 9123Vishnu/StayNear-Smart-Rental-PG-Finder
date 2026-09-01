package com.rental.project.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ManualCompanyDatabaseMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public ManualCompanyDatabaseMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        jdbcTemplate.execute("ALTER TABLE companies MODIFY COLUMN latitude DECIMAL(10,7) NULL");
        jdbcTemplate.execute("ALTER TABLE companies MODIFY COLUMN longitude DECIMAL(10,7) NULL");
        jdbcTemplate.execute("ALTER TABLE property_companies MODIFY COLUMN distance_km DECIMAL(10,3) NULL");
    }
}
