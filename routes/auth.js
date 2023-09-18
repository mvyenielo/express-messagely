"use strict";

const Router = require("express").Router;
const router = new Router();
const { BadRequestError, UnauthorizedError } = require("../expressError");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { SECRET_KEY } = require("../config");

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res) {
  if (req.body === undefined) throw new BadRequestError();
  const { username, password } = req.body;

  if (!await User.authenticate(username, password)) {
    throw new UnauthorizedError("Invalid username/password");
  }

  await User.updateLoginTimestamp(username);

  const payload = { username: username };
  const token = jwt.sign(payload, SECRET_KEY);

  return res.json({ token });
});



/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res) {
  if (req.body === undefined) throw new BadRequestError();
  const { username, password, first_name, last_name, phone } = req.body;

  await User.register({ username, password, first_name, last_name, phone });

  const payload = { username: username };
  const token = jwt.sign(payload, SECRET_KEY);

  return res.json({ token });
});

module.exports = router;