"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");

const { SECRET_KEY } = require("../config");

let u1Token;
let u2Token;
let badToken;

describe("All User Routes", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });

    const u1Payload = { username: "test1" };
    u1Token = jwt.sign(u1Payload, SECRET_KEY);

    const u2Payload = { username: "test2" };
    u2Token = jwt.sign(u2Payload, SECRET_KEY);

    const badPayload = { username: "INCORRECT USER" };
    badToken = jwt.sign(badPayload, "INCORRECT KEY");

  });

  describe("GET /users", function () {
    test("GET list of users when signed in", async function () {
      const params = new URLSearchParams({ _token: u1Token });

      let response = await request(app)
        .get(`/users/?${params}`);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(
        {
          users: [
            {
              username: "test1",
              first_name: "Test1",
              last_name: "Testy1",
            }
          ]
        }
      );
    });

    test("GET list of users with no token", async function () {
      let response = await request(app)
        .get(`/users`);

      expect(response.status).toEqual(401);
      expect(response.body).toEqual(
        {
          "error": {
            "message": "Unauthorized",
            "status": 401
          }
        }
      );
    });

    test("GET list of users with bad token", async function () {
      const params = new URLSearchParams({ _token: badToken });

      let response = await request(app)
        .get(`/users/?${params}`);

      expect(response.status).toEqual(401);
      expect(response.body).toEqual(
        {
          "error": {
            "message": "Unauthorized",
            "status": 401
          }
        }
      );
    });
  });

  describe("GET /users/username", function () {
    test("GET user by their username when signed in", async function () {
      const params = new URLSearchParams({ _token: u1Token });

      let response = await request(app)
        .get(`/users/test1/?${params}`);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(
        {
          user: {
            username: "test1",
            first_name: "Test1",
            last_name: "Testy1",
            phone: "+14155550000",
            join_at: expect.anything(),
            last_login_at: expect.anything()
          }
        }
      );
    });

    test("GET user with no token", async function () {

      let response = await request(app)
        .get(`/users/test1/`);

      expect(response.status).toEqual(401);
      expect(response.body).toEqual(
        {
          "error": {
            "message": "Unauthorized",
            "status": 401
          }
        }
      );
    });

    test("GET user with bad token", async function () {
      const params = new URLSearchParams({ _token: badToken });
      let response = await request(app)
        .get(`/users/test1/?${params}`);

      expect(response.status).toEqual(401);
      expect(response.body).toEqual(
        {
          "error": {
            "message": "Unauthorized",
            "status": 401
          }
        }
      );
    });

    test("GET user with mismatching token/username combo", async function () {
      const params = new URLSearchParams({ _token: u2Token });

      let response = await request(app)
        .get(`/users/test1/?${params}`);

      expect(response.status).toEqual(401);
      expect(response.body).toEqual(
        {
          "error": {
            "message": "Unauthorized",
            "status": 401
          }
        }
      );
    });

    test("GET user with unregistered username", async function () {
      const params = new URLSearchParams({ _token: u2Token });

      let response = await request(app)
        .get(`/users/nouser/?${params}`);

      expect(response.status).toEqual(401);
      expect(response.body).toEqual(
        {
          "error": {
            "message": "Unauthorized",
            "status": 401
          }
        }
      );
    });


  });
});


afterAll(async function () {
  await db.end();
});
