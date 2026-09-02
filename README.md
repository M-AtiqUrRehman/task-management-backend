# Task Management Backend API

A RESTful backend API for managing user accounts and tasks, built with Node.js, Express.js, MongoDB, and Mongoose.

## Features

* User registration and login
* JWT-based authentication
* Password hashing with bcrypt
* Protected API routes
* Task CRUD operations
* User-specific task management
* Request validation
* Centralized error handling
* MongoDB database integration
* Environment variable configuration

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token (JWT)
* bcrypt
* dotenv
* Postman

## Project Structure

```text
task-management-backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## API Endpoints

### Authentication

| Method | Endpoint             | Description         | Access |
| ------ | -------------------- | ------------------- | ------ |
| POST   | `/api/auth/register` | Register a new user | Public |
| POST   | `/api/auth/login`    | Login user          | Public |

### Tasks

| Method | Endpoint         | Description         | Access    |
| ------ | ---------------- | ------------------- | --------- |
| GET    | `/api/tasks`     | Get user's tasks    | Protected |
| GET    | `/api/tasks/:id` | Get a specific task | Protected |
| POST   | `/api/tasks`     | Create a task       | Protected |
| PATCH  | `/api/tasks/:id` | Update a task       | Protected |
| DELETE | `/api/tasks/:id` | Delete a task       | Protected |

## Installation

Clone the repository:

```bash
git clone https://github.com/M-AtiqUrRehman/task-management-backend.git
```

Navigate into the project:

```bash
cd task-management-backend
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Never commit your `.env` file to GitHub.

## Run the Server

Start the server:

```bash
node src/server.js
```

The API will run on:

```text
http://localhost:3000
```

For development, if a development script is configured:

```bash
npm run dev
```

## Authentication

Protected endpoints require a valid JWT token.

After logging in, include the token in the request headers:

```text
Authorization: Bearer YOUR_TOKEN
```

## Testing

The API can be tested using Postman.

Recommended testing flow:

1. Register a user
2. Login and receive JWT token
3. Add the token to protected requests
4. Create a task
5. Get all tasks
6. Get a task by ID
7. Update a task
8. Delete a task

## Error Handling

The API includes centralized error handling and validation for invalid requests, missing resources, authentication failures, and server errors.

## Future Improvements

* Pagination
* Task filtering and searching
* Task priorities and due dates
* Refresh tokens
* API documentation with Swagger
* Automated integration tests

## Author

**Atiq Ur Rehman**

GitHub: [M-AtiqUrRehman](https://github.com/M-AtiqUrRehman)
