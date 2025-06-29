package com.spotifyproject.yourspotify.advice;

import org.springframework.http.*;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleUnreadableBody(HttpMessageNotReadableException ex) {
        return ResponseEntity
                .badRequest()
                .body(Map.of("error", "Missing or invalid request body"));
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<?> handleMissingRequestHeader(MissingRequestHeaderException ex) {
        String headerName = ex.getHeaderName();
        String errorMsg = "Missing required header: " + headerName;
        HttpStatus status = "Authorization".equalsIgnoreCase(headerName) ? HttpStatus.UNAUTHORIZED : HttpStatus.BAD_REQUEST;
        return ResponseEntity
                .status(status)
                .body(Map.of("error", errorMsg));
    }

    // triggered for uncaught exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleOtherExceptions(Exception ex) {
        ex.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
    }
}