package com.transitops.util;

import com.transitops.entity.Driver;
import com.transitops.entity.User;
import com.transitops.entity.Vehicle;
import com.transitops.repository.DriverRepository;
import com.transitops.repository.UserRepository;
import com.transitops.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Users if table is empty or missing professional accounts or passwords don't match simple values
        User adminUser = userRepository.findByUsername("admin.ops@transitops.com").orElse(null);
        boolean needsSeed = adminUser == null 
                || !passwordEncoder.matches("admin123", adminUser.getPassword())
                || !userRepository.existsByUsername("dispatch.team@transitops.com")
                || !userRepository.existsByUsername("safety.first@transitops.com")
                || !userRepository.existsByUsername("finance.leads@transitops.com");

        if (needsSeed) {
            userRepository.deleteAll();
            System.out.println(">>> Wiping old users table and seeding simple professional credentials...");
            
            userRepository.save(User.builder().username("admin.ops@transitops.com").password(passwordEncoder.encode("admin123")).role("FLEET_MANAGER").build());
            userRepository.save(User.builder().username("dispatch.team@transitops.com").password(passwordEncoder.encode("dispatch123")).role("DISPATCHER").build());
            userRepository.save(User.builder().username("safety.first@transitops.com").password(passwordEncoder.encode("safety123")).role("SAFETY_OFFICER").build());
            userRepository.save(User.builder().username("finance.leads@transitops.com").password(passwordEncoder.encode("finance123")).role("FINANCIAL_ANALYST").build());
            
            System.out.println(">>> Simple professional enterprise users successfully seeded!");
        }

        // 2. Seed Vehicles if table is empty
        if (vehicleRepository.count() == 0) {
            vehicleRepository.save(Vehicle.builder()
                    .registrationNumber("TX-9876-A")
                    .model("Volvo FH16 Semi-Truck")
                    .capacity(20000.0)
                    .odometer(125000.0)
                    .purchaseCost(new BigDecimal("145000.00"))
                    .status("ACTIVE")
                    .build());

            vehicleRepository.save(Vehicle.builder()
                    .registrationNumber("TX-4321-B")
                    .model("Scania R500 Heavy-Duty")
                    .capacity(25000.0)
                    .odometer(85000.0)
                    .purchaseCost(new BigDecimal("160000.00"))
                    .status("ACTIVE")
                    .build());

            vehicleRepository.save(Vehicle.builder()
                    .registrationNumber("TX-5555-C")
                    .model("Ford F-550 Cargo Van")
                    .capacity(5000.0)
                    .odometer(45000.0)
                    .purchaseCost(new BigDecimal("65000.00"))
                    .status("IN_SHOP")
                    .build());

            System.out.println(">>> Initial vehicles fleet seeded.");
        }

        // 3. Seed Drivers if table is empty
        if (driverRepository.count() == 0) {
            driverRepository.save(Driver.builder()
                    .name("John Doe")
                    .licenseNumber("DL-88776655")
                    .licenseExpiry(LocalDate.now().plusYears(2))
                    .phone("+15550100")
                    .safetyScore(92.5)
                    .status("AVAILABLE")
                    .build());

            driverRepository.save(Driver.builder()
                    .name("Jane Smith")
                    .licenseNumber("DL-11223344")
                    .licenseExpiry(LocalDate.now().plusYears(1))
                    .phone("+15550101")
                    .safetyScore(97.0)
                    .status("AVAILABLE")
                    .build());

            driverRepository.save(Driver.builder()
                    .name("Robert Johnson")
                    .licenseNumber("DL-55667788")
                    // Expired license DL (for expired check test)
                    .licenseExpiry(LocalDate.now().minusMonths(6))
                    .phone("+15550102")
                    .safetyScore(88.0)
                    .status("AVAILABLE")
                    .build());

            System.out.println(">>> Drivers registry seeded.");
        }
    }
}
