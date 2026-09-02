# Task Management Backend

A RESTful Task Management API built with Node.js, Express.js, MongoDB, and JWT authentication.

## Features

* User registration
* User login
* JWT-based authentication
* Protected task routes
* Create, read, update, and delete tasks
* User-specific task ownership
* Input validation
* Pagination
* Error handling
* Automated API testing with Jest and Supertest

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* dotenv
* Jest
* Supertest

## Project Structure

```text
task-management-backend/
│
├── src/
│   ├── config/
│   │   ├── config.js
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   ├── validateTask.js
│   │   └── validateTaskUpdate.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── taskModel.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   │
│   ├── services/
│   │   └── taskService.js
│   │
│   ├── __tests__/
│   │   └── app.tests.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Installation

Clone or download the project and install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Never expose your actual `.env` file or secret values publicly.

## Run the Server

Start the development server:

```bash
npm start
```

The API will run on:

```text
http://localhost:3000
```

## API Endpoints

### Authentication

#### Register

```text
POST /api/auth/register
```

Request body:

```json
{
  "name": "Atiq",
  "email": "atiq@example.com",
  "password": "123456"
}
```

#### Login

```text
POST /api/auth/login
```

Request body:

```json
{
  "email": "atiq@example.com",
  "password": "123456"
}
```

The login response returns a JWT token.

### Tasks

All task endpoints require authentication.

Send the JWT token using:

```text
Authorization: Bearer <token>
```

#### Get Tasks

```text
GET /api/tasks
```

Pagination example:

```text
GET /api/tasks?page=1&limit=5
```

#### Get Single Task

```text
GET /api/tasks/:id
```

#### Create Task

```text
POST /api/tasks
```

Request body:

```json
{
  "title": "Learn Node.js"
}
```

#### Update Task

```text
PATCH /api/tasks/:id
```

Request body:

```json
{
  "title": "Learn Express.js",
  "completed": true
}
```

#### Delete Task

```text
DELETE /api/tasks/:id
```

## Authentication & Authorization

JWT authentication is used to protect task routes.

Each task belongs to the user who created it. Users can only:

* View their own tasks
* Create their own tasks
* Update their own tasks
* Delete their own tasks

Users cannot access or modify another user's tasks.

## Testing

Run the automated test suite:

```bash
npm test
```

The project currently includes tests for:

* API health check
* User registration
* User login
* Invalid login credentials
* JWT-protected routes
* Task creation
* Task retrieval
* Task updates
* Task deletion
* Task authorization
* Validation
* 404 handling
* Pagination

Current test result:

```text
Test Suites: 1 passed
Tests: 23 passed
```

## Status

Project completed with authentication, authorization, task CRUD, validation, pagination, error handling, and automated API testing.
