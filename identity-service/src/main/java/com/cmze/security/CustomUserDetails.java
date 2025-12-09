package com.cmze.security;

import com.cmze.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class CustomUserDetails implements UserDetails {

    @Getter
    private final UUID id;
    @Getter
    private final String email;

    private final String username;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    private final boolean enabled;
    private final boolean accountNonExpired;
    private final boolean credentialsNonExpired;
    private final boolean accountNonLocked;

    public CustomUserDetails(UUID id, String username, String email, String password,
                             Collection<? extends GrantedAuthority> authorities,
                             boolean enabled, boolean accountNonExpired,
                             boolean credentialsNonExpired, boolean accountNonLocked) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.enabled = enabled;
        this.accountNonExpired = accountNonExpired;
        this.credentialsNonExpired = credentialsNonExpired;
        this.accountNonLocked = accountNonLocked;
    }

    public static CustomUserDetails build(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());

        return new CustomUserDetails(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                authorities,
                // --- POPRAWKA: Przekazujemy prawdziwe wartości ---
                user.isEnabled(),
                user.isAccountNonExpired(),
                user.isCredentialsNonExpired(),
                user.isAccountNonLocked()
        );
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
}
