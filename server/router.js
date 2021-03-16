const express = require("express");
const router = express.Router();
const { checkDuplicate } = require("./users");

router.post("/login", (req, res) => {
  const { name, room } = req.body;
  const isDuplicate = checkDuplicate(name, room);

  if (isDuplicate) res.status(400).send("Duplicate User Name");

  res.status(200).send("Welcome to my server");
});

module.exports = router;
