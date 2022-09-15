const request = require("supertest");
const baseURL = "https://api.saisreekar.live";

describe("Basic LogIn", () => {
  const newUser1 = {
    username: "saisreekar",
    password: "1234qwer",
  };

  const newUser2 = {
    username: "saisreekar",
    password: "1234wer",
  };
  const newUser3 = {
    username: "saisreekar",
  };
  const newUser4 = {
    password: "1234qwer",
  };

  it("Should Login an user", async () => {
    const response = await request(baseURL)
      .post("/api/auth/logIn")
      .send(newUser1);
    expect(response.statusCode).toBe(200);
    expect(response.accessToken).not.toBeNull();
  });

  it("User Not Found", async () => {
    const response = await request(baseURL)
      .post("/api/auth/logIn")
      .send(newUser2);
    expect(response.statusCode).toBe(401);
    expect(response.accessToken).toBe(undefined);
    expect(response._body.error.errorCode).toBe(5);
  });

  it("Invalid Body No Username", async () => {
    const response = await request(baseURL)
      .post("/api/auth/logIn")
      .send(newUser3);
    expect(response.statusCode).toBe(400);
    expect(response.accessToken).toBe(undefined);
    expect(response._body.error.errorCode).toBe(2);
  });

  it("Invalid Body No Password", async () => {
    const response = await request(baseURL)
      .post("/api/auth/logIn")
      .send(newUser4);
    expect(response.statusCode).toBe(400);
    expect(response.accessToken).toBe(undefined);
    expect(response._body.error.errorCode).toBe(2);
  });
});
