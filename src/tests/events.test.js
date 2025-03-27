const request = require("supertest");
const app = require("../index");

let authToken; // Will store JWT token for authenticated requests

describe("Event API Tests", () => {
  beforeAll(async () => {
    // Signup a test user (if not already created)
    await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "testpassword",
    });

    // Login to get authentication token
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "testpassword",
    });

    authToken = loginRes.body.token; // Store JWT token
  });

  test("Create an event", async () => {
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${authToken}`) // Pass authentication
      .send({
        name: "Test Event",
        category: "Music",
        date: "2024-06-01",
        location: { coordinates: [-73.935242, 40.73061] },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
  });

  test("Get all events", async () => {
    const res = await request(app).get("/api/events");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Get a single event by ID", async () => {
    const newEvent = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Sample Event",
        category: "Sports",
        date: "2024-07-10",
        location: { coordinates: [-74.006, 40.7128] },
      });

    const eventId = newEvent.body._id;

    const res = await request(app).get(`/api/events/${eventId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Sample Event");
  });

  test("Update an event", async () => {
    const newEvent = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Event to Update",
        category: "Tech",
        date: "2024-08-15",
        location: { coordinates: [-75.343, 39.984] },
      });

    const eventId = newEvent.body._id;

    const res = await request(app)
      .put(`/api/events/${eventId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Updated Event Name",
        category: "Business",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Updated Event Name");
  });

  test("Delete an event", async () => {
    const newEvent = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${authToken}`) // ✅ Fixed incorrect .set()
      .send({
        name: "Event to Delete",
        category: "Education",
        date: "2024-09-01",
        location: { coordinates: [-80.1918, 25.7617] },
      });

    const eventId = newEvent.body._id;

    const res = await request(app)
      .delete(`/api/events/${eventId}`)
      .set("Authorization", `Bearer ${authToken}`); // ✅ Properly closed `.set()`

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Event deleted");
  });
});
