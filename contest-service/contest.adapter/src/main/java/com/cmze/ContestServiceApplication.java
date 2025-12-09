package com.cmze;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = {
        "com.cmze.external.identity",
        "com.cmze.external.quiz",
        "com.cmze.external.survey"
})
public class ContestServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ContestServiceApplication.class,args);
    }
}