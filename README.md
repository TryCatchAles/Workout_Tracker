# Workout Tracker API

A robust RESTful API for tracking workouts, exercises, and user progress. Built with Spring Boot 3, PostgreSQL, and JWT Authentication.

## 🚀 Features

*   **User Authentication**: Secure Sign-up and Login using JSON Web Tokens (JWT).
*   **Exercise Library**: Pre-populated database of exercises (Squats, Push-ups, etc.).
*   **Workout Management**:
    *   Create custom workout plans.
    *   Log sets, reps, and weights for each exercise.
    *   Update and Delete workouts.
    *   View workout history.
*   **Security**: Role-based access control (RBAC) and stateless session management.
*   **Validation**: Robust input validation to ensure data integrity.

## 🛠️ Tech Stack

*   **Java 17**
*   **Spring Boot 3** (Web, Data JPA, Security, Validation)
*   **PostgreSQL** (Database)
*   **Docker & Docker Compose** (Containerization)
*   **Lombok** (Boilerplate reduction)
*   **OpenAPI / Swagger** (API Documentation)

## ⚙️ Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/workout-tracker.git
    cd workout-tracker
    ```

2.  **Start the Database**
    Make sure you have Docker Desktop running.
    ```bash
    docker compose up -d
    ```

3.  **Run the Application**
    You can run it via your IDE (IntelliJ) or command line:
    ```bash
    ./mvnw spring-boot:run
    ```

4.  **Access API Documentation**
    Once running, open your browser to:
    *   http://localhost:8080/swagger-ui/index.html

## 🔌 API Endpoints

### Authentication
*   `POST /api/v1/auth/register` - Create a new account
*   `POST /api/v1/auth/authenticate` - Login and get JWT

### Workouts
*   `GET /api/v1/workouts` - Get all workouts for logged-in user
*   `POST /api/v1/workouts` - Create a new workout
*   `PUT /api/v1/workouts/{id}` - Update an existing workout
*   `DELETE /api/v1/workouts/{id}` - Delete a workout

## 🧪 Testing

You can test the API using **Postman** or **cURL**.

**Example: Create Workout**
```json
POST /api/v1/workouts
Headers: Authorization: Bearer <YOUR_TOKEN>
Body:
{
  "name": "Chest Day",
  "exercises": [
    {
      "exerciseId": 1,
      "sets": 3,
      "reps": 10,
      "weight": 135.0,
      "orderIndex": 1
    }
  ]
}
```
