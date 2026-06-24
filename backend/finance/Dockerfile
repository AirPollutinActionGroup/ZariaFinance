# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy gradle configuration files
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# Make gradlew executable
RUN chmod +x gradlew

# Pre-download dependencies to utilize Docker cache layers
RUN ./gradlew dependencies --no-daemon || true

# Copy source code and build boot jar
COPY src src
RUN ./gradlew bootJar --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

# Expose backend port
EXPOSE 5174

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]
