FROM openjdk:21-jdk-slim

WORKDIR /app

COPY target/cordio-0.0.1-SNAPSHOT.jar app.jar

# Exponer puerto
EXPOSE 8080

# Comando para ejecutar la aplicación
# La variable DATABASE_URL viene de Railway sin "jdbc:", así que la añadimos aquí
ENTRYPOINT ["java", "-jar", "app.jar", \
    "--spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/railway}", \
    "--spring.datasource.username=${DATABASE_USER:postgres}", \
    "--spring.datasource.password=${DATABASE_PASSWORD:password}"]
