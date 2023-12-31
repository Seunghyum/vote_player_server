import express from "express";
import Candidates from "@models/candidates";

const router = express.Router();

router.get("/", function (req, res, next) {
  Candidates.find({}).then((candidates) => {
    res.json(candidates);
  });
});

export default router;
