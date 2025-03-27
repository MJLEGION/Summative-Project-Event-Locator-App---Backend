const request = require("supertest");
const app = require("../index");

describe("Auth API Tests", () => {
  test("Signup a new user", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "testpassword",
    });
    expect(res.statusCode).toBe(201);
  });

  test("Login user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "testpassword",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
