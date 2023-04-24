package com.example.server;

import com.example.server.model.Server;
import com.example.server.repo.ServerRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import static com.example.server.enumeration.Status.SERVER_DOWN;
import static com.example.server.enumeration.Status.SERVER_UP;

@SpringBootApplication
public class ServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServerApplication.class, args);
	}

	@Bean
	CommandLineRunner run(ServerRepo serverRepo){
		return args -> {
			serverRepo.save(new Server(null, "192.168.1.160", "Ubuntu Linux", "16GB", "Personal PC", "http://localhost:8081/server/image/server1.png", SERVER_DOWN));
			serverRepo.save(new Server(null, "192.168.1.152", "UPC ROUTER", "16GB", "Internet Router", "http://localhost:8081/server/image/server2.png", SERVER_DOWN));
			serverRepo.save(new Server(null, "192.168.0.13", "Vectra Router", "64GB", "Internet Router", "http://localhost:8081/server/image/server3.png", SERVER_UP));
			serverRepo.save(new Server(null, "192.168.1.93", "AWS", "128GB", "Personal PC", "http://localhost:8081/server/image/server4.png", SERVER_UP));
		};
	}

}
