package com.ngo.finance.config;

import com.ngo.finance.entity.Message;
import com.ngo.finance.repository.MessageRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Seeds a welcome message on startup to verify the PostgreSQL connection.
 *
 * Kept out of {@link com.ngo.finance.FinanceApplication} on purpose: the main
 * class is the configuration source for {@code @WebMvcTest} slices, so a
 * repository-dependent bean declared there would fail those tests with a
 * missing-bean error.
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
