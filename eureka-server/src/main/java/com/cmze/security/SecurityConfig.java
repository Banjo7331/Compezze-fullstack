package com.cmze.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public UserDetailsService users(@Value("${app.admin-password}") String adminPass,
                                    @Value("${app.eureka-password}") String eurekaPass
    ) {

        UserDetails admin = User.withUsername("admin")
                .password("{noop}" + adminPass)
                .roles("ADMIN")
                .build();

        UserDetails eurekaClient = User.withUsername("eureka-client")
                .password("{noop}" + eurekaPass)
                .roles("EUREKA")
                .build();

        return new InMemoryUserDetailsManager(admin, eurekaClient);
    }

    @Bean
    @Order(1)
    SecurityFilterChain eurekaApi(HttpSecurity http) throws Exception {
        http.securityMatcher("/eureka/**")
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/eureka/css/**", "/eureka/js/**", "/eureka/images/**").permitAll()
                        .anyRequest().hasRole("EUREKA")
                )
                .httpBasic(Customizer.withDefaults())
                .csrf(c -> c.ignoringRequestMatchers("/eureka/**"));
        return http.build();
    }

    @Bean
    @Order(2)
    SecurityFilterChain ui(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(a -> a
                        .requestMatchers("/css/**","/js/**","/images/**").permitAll()
                        .anyRequest().hasRole("ADMIN"))
                .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}
