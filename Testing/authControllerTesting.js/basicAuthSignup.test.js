// const request = require("supertest");
// const baseURL = "https://api.saisreekar.live";

// describe("Basic SignUp", () => {
//   const newUser1 = {
//     username: "sai08",
//     password: "1234qwer",
//     email: "sai@gmail.com",
//   };

//   const newUser2 = {
//     username: "saisreekar",
//     password: "1234qwer",
//     email: "sai.sreekar@gmail.com",
//   };
//   const newUser3 = {
//     username: "saisreekar",
//     password: "1234qwer",
//   };
//   const newUser4 = {
//     username: "saisreekar",
//     email: "sai.sreekar@gmail.com",
//   };
//   const newUser5 = {
//     email: "sai.sreekar@gmail.com",
//     password: "1234qwer",
//   };

//   it("Should add an user", async () => {
//     const response = await request(baseURL)
//       .post("/api/auth/signUp")
//       .send(newUser1);
//     expect(response.statusCode).toBe(201);
//     console.log(response);
//     expect(response.accessToken).not.toBeNull();
//   });

//   it("Username Exists", async () => {
//     const response = await request(baseURL)
//       .post("/api/auth/signUp")
//       .send(newUser2);
//     expect(response.statusCode).toBe(412);
//     expect(response.accessToken).toBe(undefined);
//     expect(response._body.error.errorCode).toBe(4);
//   });

//   it("Invalid Body No Email", async () => {
//     const response = await request(baseURL)
//       .post("/api/auth/signUp")
//       .send(newUser3);
//     expect(response.statusCode).toBe(400);
//     expect(response.accessToken).toBe(undefined);
//     expect(response._body.error.errorCode).toBe(2);
//   });

//   it("Invalid Body No Password", async () => {
//     const response = await request(baseURL)
//       .post("/api/auth/signUp")
//       .send(newUser4);
//     expect(response.statusCode).toBe(400);
//     expect(response.accessToken).toBe(undefined);
//     expect(response._body.error.errorCode).toBe(2);
//   });

//   it("Invalid Body No Username", async () => {
//     const response = await request(baseURL)
//       .post("/api/auth/signUp")
//       .send(newUser5);
//     expect(response.statusCode).toBe(400);
//     expect(response.accessToken).toBe(undefined);
//     expect(response._body.error.errorCode).toBe(2);
//   });
// });
