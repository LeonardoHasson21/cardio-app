# Stage 1: Build
FROM eclipse-temurin:21-jdk-slim as builder

WORKDIR /app

# Copiar archivos de build
COPY pom.xml .
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY src src

# Ejecutar Maven build
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jdk-slim

WORKDIR /app

# Copiar JAR desde el stage anterior
COPY --from=builder /app/target/cordio-0.0.1-SNAPSHOT.jar app.jar

# Exponer puerto
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD ["sh", "-c", "java -jar app.jar --spring.datasource.url=${DATABASE_URL:-jdbc:postgresql://localhost:5432/railway} --spring.datasource.username=${DATABASE_USER:-postgres} --spring.datasource.password=${DATABASE_PASSWORD:-password}"]
