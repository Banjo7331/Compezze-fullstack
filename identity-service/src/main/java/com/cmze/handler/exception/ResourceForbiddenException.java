package com.cmze.handler.exception;

public class ResourceForbiddenException extends RuntimeException {
    public ResourceForbiddenException(String message) {
        super(message);
    }
}
