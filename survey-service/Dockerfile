FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY --from=build /app/survey.adapter/target/*.jar ./temp/

RUN find ./temp -name "*.jar" -type f ! -name "*plain.jar" ! -name "*original*" -exec cp {} app.jar \;

EXPOSE 8003

ENTRYPOINT ["java", "-jar", "app.jar"]