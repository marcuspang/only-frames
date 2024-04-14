import express from "express";

import MessageResponse from "../interfaces/MessageResponse";
import frames from "./frames";

const router = express.Router();

router.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - Running",
  });
});

router.use("/frames", frames);

export default router;
