package com.spotifyproject.yourspotify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class YourspotifyApplication {

	public static void main(String[] args) {
		SpringApplication.run(YourspotifyApplication.class, args);
	}

}
