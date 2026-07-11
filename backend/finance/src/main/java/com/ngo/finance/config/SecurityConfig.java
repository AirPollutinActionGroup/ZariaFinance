package com.ngo.finance.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.ignoringRequestMatchers(
                                                "/api/public/**",
                                                "/api/userRegister/**",
                                                "/api/userLogin/**",
                                                "/api/roles/**",
                                                "/api/v1/donors",
                                                "/api/v1/donors/**",
                                                "/api/v1/grants",
                                                "/api/v1/grants/**",
                                                "/api/v1/fund-profiles",
                                                "/api/v1/fund-profiles/**",
                                                "/api/v1/tranches",
                                                "/api/v1/tranches/**",
                                                "/api/v1/dashboard/**",
                                                "/api/v1/reports/**",
                                                "/api/v1/programmes",
                                                "/api/v1/programmes/**"))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/",
                                                                "/api/public/**",
                                                                "/api/userRegister",
                                                                "/api/userRegister/**",
                                                                "/api/userLogin",
                                                                "/api/userLogin/**",
                                                                "/api/roles",
                                                                "/api/roles/**",
                                                                "/api/v1/donors",
                                                                "/api/v1/donors/**",
                                                                "/api/v1/grants",
                                                                "/api/v1/grants/**",
                                                                "/api/v1/fund-profiles",
                                                                "/api/v1/fund-profiles/**",
                                                                "/api/v1/tranches",
                                                                "/api/v1/tranches/**",
                                                                "/api/v1/dashboard/**",
                                                                "/api/v1/reports/**",
                                                                "/api/v1/programmes",
                                                                "/api/v1/programmes/**",
                                                                "/swagger-ui.html",
                                                                "/swagger-ui/**",
                                                                "/api-docs/**",
                                                                "/api-docs")
                                                .permitAll()
                                                .anyRequest().authenticated());
                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(List.of(
                                "http://localhost:83",
                                "http://localhost:5173",
                                "http://localhost:5174",
                                "http://localhost:5175",
                                "http://127.0.0.1:83",
                                "http://127.0.0.1:5173",
                                "http://127.0.0.1:5174",
                                "http://127.0.0.1:5175"));
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
