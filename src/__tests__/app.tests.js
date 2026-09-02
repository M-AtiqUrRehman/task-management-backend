const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../app");
const connectDB = require("../config/db");

// Connect to MongoDB before running tests
beforeAll(async () => {
  await connectDB();
});

// Close MongoDB connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

// Test the root API endpoint
describe("GET /", () => {
  test("should return API running message", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      message: "Task Management Backend is running!",
    });
  });
});

// Test user registration
describe("POST /api/auth/register", () => {
  test("should register a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        password: "123456",
      });

    expect(response.statusCode).toBe(201);

    expect(response.body.message).toBe("User registered successfully");

    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.name).toBe("Test User");
    expect(response.body.user.email).toContain("@example.com");

    // Password must never be returned in the response
    expect(response.body.user).not.toHaveProperty("password");
  });
});

// Test successful login and JWT generation
describe("POST /api/auth/login", () => {
  test("should login an existing user and return JWT token", async () => {
    const email = `login${Date.now()}@example.com`;
    const password = "123456";

    // Register user first
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login Test User",
        email,
        password,
      });

    // Login user
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    expect(response.statusCode).toBe(200);

    expect(response.body.message).toBe("Login successful");

    // JWT token should be returned
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");

    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.name).toBe("Login Test User");
    expect(response.body.user.email).toBe(email);

    // Password must never be returned
    expect(response.body.user).not.toHaveProperty("password");
  });
});

// Test invalid login scenarios
describe("POST /api/auth/login - validation", () => {

  // Test incorrect password
  test("should reject incorrect password", async () => {
    const email = `wrongpass${Date.now()}@example.com`;

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Wrong Password User",
        email,
        password: "123456",
      });

    // Login using wrong password
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "wrongpassword",
      });

    expect(response.statusCode).toBe(401);

    expect(response.body.message).toBe("Invalid email or password");
  });

  // Test login with non-existing user
  test("should reject non-existing user", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: `notexist${Date.now()}@example.com`,
        password: "123456",
      });

    expect(response.statusCode).toBe(401);

    expect(response.body.message).toBe("Invalid email or password");
  });

  // Test missing login credentials
  test("should reject missing credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Email and password are required"
    );
  });
});

// Test protected task routes
describe("Protected Task Routes", () => {

  // Test that tasks cannot be accessed without JWT
  test("should reject access without JWT token", async () => {
    const response = await request(app)
      .get("/api/tasks");

    expect(response.statusCode).toBe(401);
  });

  // Test that authenticated users can access their tasks
  test("should allow access with valid JWT token", async () => {
    const email = `taskuser${Date.now()}@example.com`;
    const password = "123456";

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Task Test User",
        email,
        password,
      });

    // Login user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Access protected route
    const response = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("tasks");
    expect(response.body).toHaveProperty("pagination");
    expect(Array.isArray(response.body.tasks)).toBe(true);
  });
});

// Test task creation
describe("POST /api/tasks", () => {
  test("should create a task for authenticated user", async () => {
    const email = `createtask${Date.now()}@example.com`;
    const password = "123456";

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Create Task User",
        email,
        password,
      });

    // Login user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Create task
    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Automated Testing",
      });

    expect(response.statusCode).toBe(201);

    expect(response.body).toHaveProperty("task");

    expect(response.body.task.title).toBe("Automated Testing");
    expect(response.body.task.completed).toBe(false);
    expect(response.body.task).toHaveProperty("user");
  });
});

// Test getting a single task
describe("GET /api/tasks/:id", () => {
  test("should return a specific task for authenticated user", async () => {
    const email = `gettask${Date.now()}@example.com`;
    const password = "123456";

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Get Task User",
        email,
        password,
      });

    // Login user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Create task
    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Get Single Task",
      });

    const taskId = createResponse.body.task._id;

    // Get task by ID
    const response = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("task");
    expect(response.body.task._id).toBe(taskId);
    expect(response.body.task.title).toBe("Get Single Task");
  });
});

// Test updating a task using PATCH
describe("PATCH /api/tasks/:id", () => {
  test("should update a task for authenticated user", async () => {
    const email = `updatetask${Date.now()}@example.com`;
    const password = "123456";

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Update Task User",
        email,
        password,
      });

    // Login user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Create task
    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Original Task",
      });

    const taskId = createResponse.body.task._id;

    // Update task
    const response = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Task",
        completed: true,
      });

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("task");
    expect(response.body.task._id).toBe(taskId);
    expect(response.body.task.title).toBe("Updated Task");
    expect(response.body.task.completed).toBe(true);
  });
});

// Test deleting a task
describe("DELETE /api/tasks/:id", () => {
  test("should delete a task for authenticated user", async () => {
    const email = `deletetask${Date.now()}@example.com`;
    const password = "123456";

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Delete Task User",
        email,
        password,
      });

    // Login user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Create task
    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task To Delete",
      });

    const taskId = createResponse.body.task._id;

    // Delete task
    const response = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.message).toBe("Task deleted successfully");
    expect(response.body.task._id).toBe(taskId);
  });
});

describe("Task Authorization", () => {
  test("should not allow a user to access another user's task", async () => {
    const userA = {
      email: `userA${Date.now()}@example.com`,
      password: "123456",
    };

    const userB = {
      email: `userB${Date.now()}@example.com`,
      password: "123456",
    };

    // Register User A
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "User A",
        email: userA.email,
        password: userA.password,
      });

    // Register User B
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "User B",
        email: userB.email,
        password: userB.password,
      });

    // Login User A
    const loginA = await request(app)
      .post("/api/auth/login")
      .send(userA);

    const tokenA = loginA.body.token;

    // Login User B
    const loginB = await request(app)
      .post("/api/auth/login")
      .send(userB);

    const tokenB = loginB.body.token;

    // User B creates a task
    const taskResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        title: "User B Private Task",
      });

    const taskId = taskResponse.body.task._id;

    // User A tries to access User B's task
    const response = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Task not found");
  });
});

describe("Task Authorization - PATCH & DELETE", () => {
  test("should not allow a user to update another user's task", async () => {
    const userA = {
      email: `patchA${Date.now()}@example.com`,
      password: "123456",
    };

    const userB = {
      email: `patchB${Date.now()}@example.com`,
      password: "123456",
    };

    // Register both users
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Patch User A",
        email: userA.email,
        password: userA.password,
      });

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Patch User B",
        email: userB.email,
        password: userB.password,
      });

    // Login both users
    const loginA = await request(app)
      .post("/api/auth/login")
      .send(userA);

    const loginB = await request(app)
      .post("/api/auth/login")
      .send(userB);

    const tokenA = loginA.body.token;
    const tokenB = loginB.body.token;

    // User B creates a task
    const taskResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        title: "Private Task",
      });

    const taskId = taskResponse.body.task._id;

    // User A tries to update User B's task
    const response = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Unauthorized Update",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Task not found");
  });

  test("should not allow a user to delete another user's task", async () => {
    const userA = {
      email: `deleteA${Date.now()}@example.com`,
      password: "123456",
    };

    const userB = {
      email: `deleteB${Date.now()}@example.com`,
      password: "123456",
    };

    // Register both users
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Delete User A",
        email: userA.email,
        password: userA.password,
      });

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Delete User B",
        email: userB.email,
        password: userB.password,
      });

    // Login both users
    const loginA = await request(app)
      .post("/api/auth/login")
      .send(userA);

    const loginB = await request(app)
      .post("/api/auth/login")
      .send(userB);

    const tokenA = loginA.body.token;
    const tokenB = loginB.body.token;

    // User B creates a task
    const taskResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        title: "Task To Protect",
      });

    const taskId = taskResponse.body.task._id;

    // User A tries to delete User B's task
    const response = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Task not found");
  });
});

describe("POST /api/tasks - validation", () => {
  test("should reject task without title", async () => {
    const email = `validation${Date.now()}@example.com`;
    const password = "123456";

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Validation User",
        email,
        password,
      });

    // Login user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Try creating task without title
    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe("Title is required");
  });
});

describe("PATCH /api/tasks/:id - validation", () => {
  test("should reject empty update", async () => {
    const email = `patchvalidation${Date.now()}@example.com`;
    const password = "123456";

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Patch Validation User",
        email,
        password,
      });

    // Login user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Create task
    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Validation Task",
      });

    const taskId = createResponse.body.task._id;

    // Try updating without any fields
    const response = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "At least one field is required"
    );
  });

  test("should reject invalid completed value", async () => {
    const email = `completedvalidation${Date.now()}@example.com`;
    const password = "123456";

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Completed Validation User",
        email,
        password,
      });

    // Login user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Create task
    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Completed Validation Task",
      });

    const taskId = createResponse.body.task._id;

    // Try updating completed with a non-boolean value
    const response = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        completed: "yes",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Completed must be a boolean"
    );
  });
});

describe("Task Not Found", () => {
  test("should return 404 when task does not exist", async () => {
    const email = `notfound${Date.now()}@example.com`;
    const password = "123456";

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Not Found User",
        email,
        password,
      });

    // Login user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Request a non-existing task
    const response = await request(app)
      .get("/api/tasks/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);

    expect(response.body.message).toBe("Task not found");
  });

  test("should return 404 when updating a non-existing task", async () => {
    const email = `update404${Date.now()}@example.com`;
    const password = "123456";

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Update 404 User",
        email,
        password,
      });

    // Login user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Update a non-existing task
    const response = await request(app)
      .patch("/api/tasks/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Task",
      });

    expect(response.statusCode).toBe(404);

    expect(response.body.message).toBe("Task not found");
  });

  test("should return 404 when deleting a non-existing task", async () => {
    const email = `delete404${Date.now()}@example.com`;
    const password = "123456";

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Delete 404 User",
        email,
        password,
      });

    // Login user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Delete a non-existing task
    const response = await request(app)
      .delete("/api/tasks/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);

    expect(response.body.message).toBe("Task not found");
  });
});

describe("GET /api/tasks - pagination", () => {
  test("should return paginated tasks", async () => {
    const email = `pagination${Date.now()}@example.com`;
    const password = "123456";

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Pagination User",
        email,
        password,
      });

    // Login user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Create 6 tasks
    for (let i = 1; i <= 6; i++) {
      await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: `Pagination Task ${i}`,
        });
    }

    // Request first page with limit 5
    const response = await request(app)
      .get("/api/tasks?page=1&limit=5")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("tasks");
    expect(response.body).toHaveProperty("pagination");

    // First page should contain 5 tasks
    expect(response.body.tasks).toHaveLength(5);

    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(5);
    expect(response.body.pagination.totalTasks).toBe(6);
    expect(response.body.pagination.totalPages).toBe(2);
  });

  test("should return second page of tasks", async () => {
    const email = `pagination2${Date.now()}@example.com`;
    const password = "123456";

    // Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Pagination User 2",
        email,
        password,
      });

    // Login user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Create 6 tasks
    for (let i = 1; i <= 6; i++) {
      await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: `Page Task ${i}`,
        });
    }

    // Request second page
    const response = await request(app)
      .get("/api/tasks?page=2&limit=5")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    // Second page should contain the remaining 1 task
    expect(response.body.tasks).toHaveLength(1);

    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.limit).toBe(5);
    expect(response.body.pagination.totalTasks).toBe(6);
    expect(response.body.pagination.totalPages).toBe(2);
  });
});