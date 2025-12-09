package com.cmze.security;

import com.cmze.entity.User;
import com.cmze.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Not found with usernameOrEmail: "+usernameOrEmail));

        // Set<GrantedAuthority> grantedAuthorities = user.getRoles().stream().map(role -> new SimpleGrantedAuthority(role.getName().name()))
        //         .collect(Collectors.toSet());
        //
        // return new CustomUserDetails(user.getId(), user.getUsername(),user.getEmail(), user.getPassword(), grantedAuthorities);

        return CustomUserDetails.build(user);
    }
}
