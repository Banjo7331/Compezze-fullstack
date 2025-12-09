package com.cmze.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @NotEmpty
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    private String username;

    @NotEmpty
    @Email(message = "Email should be valid")
    private String email;

    @NotEmpty
    @Size(min = 12, max = 40, message = "Password must be between 12 and 40 characters")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).*$",
            message = "Password must contain at least one uppercase letter and one special character"
    )
    private String password;

}
