package com.ngo.finance;

import com.ngo.finance.entity.Message;
import com.ngo.finance.repository.MessageRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class FinanceApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinanceApplication.class, args);
	}

	@GetMapping("/")
    public String home() {
       return "Welcome to Zariya Finance!";
    }

	@Bean
	public CommandLineRunner initData(MessageRepository repository) {
		return args -> {
			if (repository.count() == 0) {
				Message message = new Message();
				message.setContent("Welcome to Zariya Finance! Successful connection to PostgreSQL.");
				repository.save(message);
			}
		};
	}
}
