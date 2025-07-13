package com.spotifyproject.spotirecap.service;

import com.spotifyproject.spotirecap.exception.SpotifyApiException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;


@Service
public class SpotifyService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spotify.client-id}")
    private String clientId;

    @Value("${spotify.client-secret}")
    private String clientSecret;

    @Value("${spotify.redirect-uri}")
    private String redirectUri;

    public Map<String, String> getAccessToken(String code) {
        String tokenEndpoint = "https://accounts.spotify.com/api/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth(clientId, clientSecret);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("code", code);
        form.add("redirect_uri", redirectUri);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(tokenEndpoint, request, Map.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new SpotifyApiException("Failed to fetch access token from Spotify");
        }

        Map<String, String> tokenResults = new HashMap<>();
        tokenResults.put("access_token", (String) response.getBody().get("access_token"));
        tokenResults.put("refresh_token", (String) response.getBody().get("refresh_token"));

        return tokenResults;
    }

    public Map refreshAccessToken(String refreshToken) {
        String tokenEndpoint = "https://accounts.spotify.com/api/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth(clientId, clientSecret);

        MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
        requestBody.add("grant_type", "refresh_token");
        requestBody.add("refresh_token", refreshToken);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(tokenEndpoint, request, Map.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new SpotifyApiException("Failed to fetch refresh token from Spotify");
        }

        return response.getBody();
    }

    @Cacheable(
            value = "topTracks",
            key = "#accessToken + '_' + #timeRange + '_' + #amount"
    )
    public List<Map<String, String>> getTopTracks(String accessToken, String timeRange, String amount) {
        System.out.println("❌ cache miss /top-tracks " + "time range: " + timeRange + " amount: " + amount );
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

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new SpotifyApiException("Failed to fetch top tracks from Spotify");
        }

        // simplifying the raw response bc it is BULKY
        // @TODO extract this simplification process into a function
        List<Map<String, String>> simplifiedResponse = new ArrayList<>();
        List<Map<String, Object>> items = (List<Map<String, Object>>) response.getBody().get("items");

        for (Map<String, Object> item : items) {
            String trackName = (String) item.get("name");

            List<Map<String, Object>> artists = (List<Map<String, Object>>) item.get("artists");
            String artistNames = artists.stream()
                    .map(a -> (String) a.get("name"))
                    .collect(Collectors.joining(", "));

            Map<String, Object> album = (Map<String, Object>) item.get("album");
            List<Map<String, Object>> images = (List<Map<String, Object>>) album.get("images");
            String albumCoverUrl = (String) images.get(0).get("url");

            Map<String, String> track = new HashMap<>();
            track.put("name", trackName);
            track.put("artists", artistNames);
            track.put("albumCoverUrl", albumCoverUrl);
            simplifiedResponse.add(track);
        }

        return simplifiedResponse;
    }

    @Cacheable(
            value = "topArtists",
            key = "#accessToken + '_' + #timeRange + '_' + #amount"
    )
    public List<Map<String, Object>> getTopArtists(String accessToken, String timeRange, String amount) {
        System.out.println("❌ cache miss /top-artists " + "time range: " + timeRange + " amount: " + amount );
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

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new SpotifyApiException("Failed to fetch top artists from Spotify");
        }

        // simplifying raw response
        // @TODO extract this simplification process into a function
        List<Map<String, Object>> simplifiedResponse = new ArrayList<>();
        List<Map<String, Object>> items = (List<Map<String, Object>>) response.getBody().get("items");

        for(Map<String, Object> item: items) {
            Map<String, Object> artistInfo = new HashMap<>();

            String artistName = (String) item.get("name");
            artistInfo.put("name", artistName);

            List<Map<String, Object>> images = (List<Map<String, Object>>) item.get("images");
            String artistImageUrl = (String) images.get(0).get("url");
            artistInfo.put("artistImageUrl", artistImageUrl);

            List<String> artistGenres = (List<String>) item.get("genres");
            artistInfo.put("genres", artistGenres.stream().limit(2).collect(Collectors.toList()));

            simplifiedResponse.add(artistInfo);
        }

        // [{"artistImageUrl": "https://inserturlhere.com", "name": "Drake"}]
        return simplifiedResponse;
    }

    @Cacheable(
            value = "topGenres",
            key = "#accessToken + '_' + #timeRange + '_' + #amount"
    )
    public List<Map<String, Object>> getTopGenres(String accessToken, String timeRange, String amount) {
        System.out.println("❌ cache miss /top-genres " + "time range: " + timeRange + " amount: " + amount );
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

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new SpotifyApiException("Failed to fetch top genres from Spotify");
        }

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

        return sortedGenres;
    }

    public String getUserFirstName(String accessToken) {
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

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new SpotifyApiException("Failed to fetch user profile from Spotify");
        }

        String userFullName = (String) response.getBody().get("display_name");
        String userFirstName = userFullName.split(" ")[0];

        return userFirstName;
    }
}
