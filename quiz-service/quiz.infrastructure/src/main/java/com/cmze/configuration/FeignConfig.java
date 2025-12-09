package com.cmze.configuration;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            final var attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes != null) {
                final var authHeader = attributes.getRequest().getHeader(HttpHeaders.AUTHORIZATION);

                if (StringUtils.hasText(authHeader)) {
                    requestTemplate.header(HttpHeaders.AUTHORIZATION, authHeader);
                }
            }
        };
    }
}
