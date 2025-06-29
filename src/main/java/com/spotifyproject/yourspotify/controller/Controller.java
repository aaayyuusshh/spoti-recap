package com.spotifyproject.yourspotify.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class Controller {

    private final RestTemplate restTemplate = new RestTemplate();
    @Value("${spotify.client-id}")
    private String clientId;

    @Value("${spotify.client-secret}")
    private String clientSecret;

    @Value("${spotify.redirect-uri}")
    private String redirectUri;

    @GetMapping("/test")
    public String sendResponse() {
        return "valid";
    }

    @PostMapping("/auth/token")
    public ResponseEntity<?> getAccessToken(@RequestBody Map<String, String> body) {
        try {
            System.out.println("--------------------------------------");
            System.out.println("in getAccessToken " + body.get("code"));
            String tokenEndpoint = "https://accounts.spotify.com/api/token";

            String code = body.get("code");
            if(code == null || code.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing code in body"));
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(clientId, clientSecret);

            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("grant_type", "authorization_code");
            form.add("code", code);
            form.add("redirect_uri", redirectUri);
            System.out.println("form: " + form);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenEndpoint, request, Map.class);
            if(!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", "Failed to fetch token from Spotify"));
            }

            System.out.println("spotify token response: " + response.getBody());

            Map<String, String> tokenResults = new HashMap<>();
            tokenResults.put("access_token", (String)response.getBody().get("access_token"));
            tokenResults.put("refresh_token", (String)response.getBody().get("refresh_token"));

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
                System.out.println("--refresh error--");
                return ResponseEntity.badRequest().body(Map.of("error", "Missing refresh_token in body"));
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(clientId, clientSecret);

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("grant_type", "refresh_token");
            requestBody.add("refresh_token", refreshToken);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenEndpoint, request, Map.class);
            if(!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", "Failed to refresh token from Spotify"));
            }

            return ResponseEntity.ok(response.getBody());
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

        System.out.println("--------------------------------------");
        System.out.println("in get top tracks: " + accessToken);

        String topTracksEndpoint = "https://api.spotify.com/v1/me/top/tracks?limit=" + amount + "&time_range=" + timeRange;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                topTracksEndpoint,
                HttpMethod.GET,
                request,
                Map.class
        );

        // simplifying the raw response bc it is BULKY
        // @TODO extract this simplification process into a function
        List<Map<String, String>> simplifiedResponse = new ArrayList<>();
        List<Map<String, Object>> items = (List<Map<String, Object>>) response.getBody().get("items");

        for(Map<String, Object> item : items) {
            String trackName = (String) item.get("name");

            List<Map<String, Object>> artists = (List<Map<String, Object>>) item.get("artists");
            String artistNames = artists.stream()
                    .map(a -> (String) a.get("name"))
                    .collect(Collectors.joining(", "));

            System.out.println("🎵 " + trackName + " by " + artistNames);

            Map<String, Object> album = (Map<String, Object>) item.get("album");
            List<Map<String, Object>> images = (List<Map<String, Object>>) album.get("images");
            String albumCoverUrl = (String) images.get(0).get("url");

            Map<String, String> track = new HashMap<>();
            track.put("name", trackName);
            track.put("artists", artistNames);
            track.put("albumCoverUrl", albumCoverUrl);
            simplifiedResponse.add(track);
        }

        // simplified version:  [{name: "Drake", song: "Redemption"}, {name: "Jamesy", song: "Wagwan Remix"}]
        return ResponseEntity.ok(simplifiedResponse);
    }

    @GetMapping("/top-artists")
    public ResponseEntity<?> getTopArtists(
            @RequestHeader("Authorization") String accessToken,
            @RequestParam(name = "timeRange", defaultValue = "long_term") String timeRange,
            @RequestParam(name = "amount", defaultValue = "10") String amount
    ) {
        String topArtistsEndpoint = "https://api.spotify.com/v1/me/top/artists?limit=" + amount + "&time_range=" + timeRange;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                topArtistsEndpoint,
                HttpMethod.GET,
                request,
                Map.class
        );

        // simplifying raw response
        // @TODO extract this simplification process into a function
        List<Map<String, Object>> simplifiedResponse = new ArrayList<>();
        List<Map<String, Object>> items = (List<Map<String, Object>>) response.getBody().get("items");

        for(Map<String, Object> item: items) {
            Map<String, Object> artistInfo = new HashMap<>();

            String artistName = (String) item.get("name");
            artistInfo.put("name", artistName);
            System.out.println("🎤 " + artistName);

            List<Map<String, Object>> images = (List<Map<String, Object>>) item.get("images");
            String artistImageUrl = (String) images.get(0).get("url");
            artistInfo.put("artistImageUrl", artistImageUrl);

            List<String> artistGenres = (List<String>) item.get("genres");
            artistInfo.put("genres", artistGenres.stream().limit(2).collect(Collectors.toList()));

            simplifiedResponse.add(artistInfo);
        }

        // [{"artistImageUrl": "https://inserturlhere.com", "name": "Drake"}]
        return ResponseEntity.ok(simplifiedResponse);
    }

    @GetMapping("/top-genres")
    // @TODO double work of calling /top/artists endpoint, refactor
    public ResponseEntity<?> getTopGenres(
            @RequestHeader("Authorization") String accessToken,
            @RequestParam(name = "timeRange", defaultValue = "long_term") String timeRange,
            @RequestParam(name = "amount", defaultValue = "10") String amount
    ) {
        String topArtistsEndpoint = "https://api.spotify.com/v1/me/top/artists?limit=50&time_range=" + timeRange;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                topArtistsEndpoint,
                HttpMethod.GET,
                request,
                Map.class
        );

        List<Map<String, Object>> items = (List<Map<String, Object>>) response.getBody().get("items");
        Map<String, Integer> genreFrequency = new HashMap<>();
        Map<String, List<String>> genreArtistImageMap = new HashMap<>();

        for(Map<String, Object> item: items) {
            ArrayList<String> genres = (ArrayList<String>) item.get("genres");
            List<Map<String, Object>> artistImages = (List<Map<String, Object>>)item.get("images");
            String artistImageUrl = (String) artistImages.get(0).get("url");


            for(String genre: genres) {
                genreFrequency.put(genre, genreFrequency.getOrDefault(genre, 0) + 1);
                genreArtistImageMap.putIfAbsent(genre, new ArrayList<>());
                genreArtistImageMap.get(genre).add(artistImageUrl);
            }
        }

        int limitAmount = Integer.parseInt(amount);
        // sorting in descending order
        List<Map<String, Object>> sortedGenres = genreFrequency.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(limitAmount)
                .map(entry -> {
                    Map<String, Object> genreData = new HashMap<>();
                    genreData.put("genre", entry.getKey());
                    genreData.put("count", entry.getValue());

                    List<String> artistImagesForGenre = genreArtistImageMap.getOrDefault(entry.getKey(), Collections.emptyList());
                    genreData.put("genreArtistImageUrls",
                        artistImagesForGenre.stream()
                                .limit(9)
                                .collect(Collectors.toList()));

                    return genreData;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(sortedGenres);
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserName(@RequestHeader("Authorization") String accessToken) {
        System.out.println("in /user");
        String userProfileEndpoint = "https://api.spotify.com/v1/me";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                userProfileEndpoint,
                HttpMethod.GET,
                request,
                Map.class
        );

        String userFullName = (String) response.getBody().get("display_name");
        String userFirstName = userFullName.split(" ")[0];

        return ResponseEntity.ok(Collections.singletonMap("userFirstName", userFirstName));
    }
}
