package com.ngo.finance.config;

import com.ngo.finance.entity.Message;
import com.ngo.finance.repository.MessageRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Startup data seeding. Kept out of the main application class so web-slice
 * tests (@WebMvcTest) don't try to wire the MessageRepository.
 */
@Configuration
public class DataInitializer {

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
