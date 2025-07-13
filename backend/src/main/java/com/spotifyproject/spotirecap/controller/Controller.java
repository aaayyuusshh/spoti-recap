package com.spotifyproject.spotirecap.controller;

import com.spotifyproject.spotirecap.service.SpotifyService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class Controller {

    @Autowired
    private SpotifyService spotifyService;

    @GetMapping("/test")
    public String sendResponse() {
        return "valid";
    }

    @PostMapping("/auth/token")
    public ResponseEntity<?> getAccessToken(@RequestBody Map<String, String> body) {
        try {
            String code = body.get("code");
            if(code == null || code.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing code in body"));
            }

            Map<String, String> tokenResults = spotifyService.getAccessToken(code);
            return ResponseEntity.ok(tokenResults);
        }
        catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal server error"));
        }
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<?> refreshAccessToken(@RequestBody Map<String, String> body) {
        try {
            String tokenEndpoint = "https://accounts.spotify.com/api/token";
            String refreshToken = body.get("refresh_token");
            if (refreshToken == null || refreshToken.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing refresh_token in body"));
            }

            Map refreshedTokenResults = spotifyService.refreshAccessToken(refreshToken);
            return ResponseEntity.ok(refreshedTokenResults);
        }
        catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal server error"));
        }
    }

    @GetMapping("/top-tracks")
    public ResponseEntity<?> getTopTracks(
            @RequestHeader("Authorization") String accessToken,
            @RequestParam(name = "timeRange", defaultValue = "long_term") String timeRange,
            @RequestParam(name = "amount", defaultValue = "10") String amount
    ) {
        try {
            if (accessToken == null || !accessToken.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid access token"));
            }

            List<Map<String, String>> topTracks = spotifyService.getTopTracks(accessToken, timeRange, amount);
            return ResponseEntity.ok(topTracks);
        }
        catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal server error"));
        }
    }

    @GetMapping("/top-artists")
    public ResponseEntity<?> getTopArtists(
            @RequestHeader("Authorization") String accessToken,
            @RequestParam(name = "timeRange", defaultValue = "long_term") String timeRange,
            @RequestParam(name = "amount", defaultValue = "10") String amount
    ) {
        try  {
            String topArtistsEndpoint = "https://api.spotify.com/v1/me/top/artists?limit=" + amount + "&time_range=" + timeRange;

            if (accessToken == null || !accessToken.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid access token"));
            }

            List<Map<String, Object>> topArtists = spotifyService.getTopArtists(accessToken, timeRange, amount);
            return ResponseEntity.ok(topArtists);
        }
        catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal server error"));
        }
    }

    @GetMapping("/top-genres")
    // @TODO double work of calling /top/artists endpoint, refactor
    public ResponseEntity<?> getTopGenres(
            @RequestHeader("Authorization") String accessToken,
            @RequestParam(name = "timeRange", defaultValue = "long_term") String timeRange,
            @RequestParam(name = "amount", defaultValue = "10") String amount
    ) {
        try {
            if(accessToken == null || !accessToken.startsWith(("Bearer "))) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid access token"));
            }

            List<Map<String, Object>> topGenres = spotifyService.getTopGenres(accessToken, timeRange, amount);
            return ResponseEntity.ok(topGenres);
        }
        catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal server error"));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserName(@RequestHeader("Authorization") String accessToken) {
        try {
            if(accessToken == null || !accessToken.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid access token"));
            }

            String userFirstName = spotifyService.getUserFirstName(accessToken);
            return ResponseEntity.ok(Collections.singletonMap("userFirstName", userFirstName));
        }
        catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal server error"));
        }
    }
}
