"use strict";

const Router = require("express").Router;
const router = new Router();
const { ensureLoggedIn } = require("../middleware/auth");
const Message = require("../models/message");
const { BadRequestError, UnauthorizedError } = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function (req, res) {
  const message = await Message.get(req.params.id);

  if (res.locals.user.username === message.from_user.username ||
    res.locals.user.username === message.to_user.username) {
    return res.json({ message });
  }

  throw new UnauthorizedError("Not authorized.");
});



/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function (req, res) {
  if (req.body === undefined) throw new BadRequestError();

  const { to_username, body } = req.body;
  const from_username = res.locals.user.username;

  const message = await Message.create({ from_username, to_username, body });

  return res.json({ message });
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
**/
router.post("/:id/read", ensureLoggedIn, async function (req, res) {
  const getMessage = await Message.get(req.params.id);

  if (res.locals.user.username === getMessage.to_user.username) {
    const message = await Message.markRead(req.params.id);
    return res.json({ message });
  }

  throw new UnauthorizedError("Not authorized.");
});



module.exports = router;