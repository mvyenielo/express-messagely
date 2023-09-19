"use strict";

const Router = require("express").Router;
const router = new Router();


router.get("/", function (req, res) {

  return res.render('registration.html');
});




module.exports = router;