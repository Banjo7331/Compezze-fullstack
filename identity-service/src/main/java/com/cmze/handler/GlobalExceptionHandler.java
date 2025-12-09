package com.cmze.handler;

import com.cmze.handler.exception.InvalidRequestException;
import com.cmze.handler.exception.ResourceForbiddenException;
import com.cmze.handler.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        logger.warn(ex.getMessage()); // Log as warning
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Resource Not Found");
        return pd;
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ProblemDetail handleInvalidRequestException(InvalidRequestException ex, WebRequest request) {
        logger.warn(ex.getMessage());
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        pd.setTitle("Invalid Request");
        return pd;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        logger.warn("Validation failed: {}", errors);
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, errors);
        pd.setTitle("Validation Failed");
        return pd;
    }

    @ExceptionHandler(ResourceForbiddenException.class)
    public ProblemDetail handleResourceForbiddenException(ResourceForbiddenException ex, WebRequest request) {
        logger.warn(ex.getMessage());
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, ex.getMessage());
        pd.setTitle("Access Denied");
        return pd;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleAllUncaughtException(Exception ex, WebRequest request) {
        logger.error("An unexpected error occurred: {}", ex.getMessage(), ex);

        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected internal error occurred. Please contact support."
        );
        pd.setTitle("Internal Server Error");
        return pd;
    }
}
