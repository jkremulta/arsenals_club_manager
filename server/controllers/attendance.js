const attendanceRouter = require("express").Router();
const Training = require("../models/training");
const Player = require("../models/players");
const { userExtractor } = require("../utils/middleware");

const isAttendanceOpen = (startTime) => {
  const now = Date.now();
  const start = new Date(startTime).getTime();
  // Allow check-in starting 30 minutes before start time
  return now >= start - 30 * 60 * 1000;
};

attendanceRouter.get("/", userExtractor, async (request, response) => {
  const activeTraining = await Training.findOne({ isActive: true }).populate(
    "attendance",
    { name: 1, games_played: 1, paid: 1, skill: 1, late: 1 },
  );

  // to stop error on log in
  if (!activeTraining) {
    return response.status(200).json([]);
  }

  response.json(activeTraining.attendance);
});

// Admin route
attendanceRouter.post("/", userExtractor, async (request, response) => {
  const { id } = request.body || {};
  if (!id) return response.status(400).json({ error: "id is required" });

  const activeTraining = await Training.findOne({ isActive: true });

  if (!activeTraining)
    return response.status(400).json({ error: "No active training" });

  if (!isAttendanceOpen(activeTraining.startTime)) {
    return response.status(400).json({
      error:
        "Attendance is not open yet. Check-in opens 30 minutes before training starts.",
    });
  }

  const player = await Player.findById(id);

  if (!player) {
    return response.status(404).json({ error: "Player not found" });
  }

  if (!activeTraining.attendance.includes(id)) {
    activeTraining.attendance.push(id);
    await activeTraining.save();
    const msElapsed = Date.now() - new Date(activeTraining.startTime).getTime();
    const isLate = msElapsed > 45 * 60 * 1000;
    await Player.findByIdAndUpdate(id, { late: isLate });
  }

  const populated = await Training.findOne({ isActive: true }).populate(
    "attendance",
  );

  return response.status(201).json({
    ...populated.toObject(),
    addedPlayer: player.name,
  });
});

attendanceRouter.delete("/:id", userExtractor, async (request, response) => {
  const { id } = request.params;

  const activeTraining = await Training.findOne({ isActive: true });

  if (!activeTraining) {
    return response.status(404).json({ error: "no active training found" });
  }

  activeTraining.attendance = activeTraining.attendance.filter(
    (playerId) => playerId.toString() !== id,
  );

  await activeTraining.save();
  return response.status(204).end();
});

attendanceRouter.put("/:id", userExtractor, async (request, response) => {
  const { id } = request.params;
  const body = request.body;

  const activeTraining = await Training.findOne({ isActive: true });

  if (!activeTraining) {
    return response.status(404).json({ error: "No active training" });
  }

  const inAttendance = activeTraining.attendance.some(
    (p) => p.toString() === id,
  );

  if (!inAttendance) {
    return response.status(404).json({ error: "Player is not in attendance" });
  }

  const updatedPlayer = await Player.findByIdAndUpdate(
    id,
    { ...body },
    { returnDocument: "after" },
  );

  if (!updatedPlayer) {
    return response.status(404).json({ error: "Player not found" });
  }

  const updatedTraining = await Training.findOne({ isActive: true }).populate(
    "attendance",
  );

  return response.json(updatedTraining);
});

// Manual route (players)
attendanceRouter.post("/manual", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const activeTraining = await Training.findOne({ isActive: true });
  if (!activeTraining)
    return res.status(400).json({ error: "No active training session" });

  if (!isAttendanceOpen(activeTraining.startTime)) {
    return res.status(400).json({
      error:
        "Attendance is not open yet. Check-in opens 30 minutes before training starts.",
    });
  }

  const words = name.trim().split(/\s+/);
  const wordFilters = words.map((word) => ({
    name: { $regex: word, $options: "i" },
  }));
  const matches = await Player.find({ $and: wordFilters }).select("_id name");

  if (matches.length === 0)
    return res.status(404).json({ error: "Name not registered." });
  if (matches.length > 1)
    return res
      .status(409)
      .json({ error: "Multiple players matched. Please type your full name." });

  const player = matches[0];
  const alreadyIn = activeTraining.attendance
    .map((id) => id.toString())
    .includes(player._id.toString());
  if (alreadyIn)
    return res.status(400).json({ error: "You are already checked in." });

  activeTraining.attendance.push(player._id);
  await activeTraining.save();
  const msElapsed = Date.now() - new Date(activeTraining.startTime).getTime();
  const isLate = msElapsed > 45 * 60 * 1000;
  await Player.findByIdAndUpdate(player._id, { late: isLate });
  return res.status(201).json({ ok: true });
});

module.exports = attendanceRouter;
