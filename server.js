const express = require("express");

const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");

const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/users");
const surveyRoutes = require("./routes/survey");
const careTeamRoutes = require("./routes/careteam");
const chatRoutes = require("./routes/chat");

const app = express();
connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://omnihealth-dashboard.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
app.use("/api", messageRoutes);
app.use("/api", userRoutes);
app.use("/api", surveyRoutes);
app.use("/api", careTeamRoutes);
app.use(chatRoutes);
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "style-src-elem": ["'self'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
    },
  })
);

app.get("/", (req, res) => {
  res.send("WhatsApp bot is running ✅");
});

app.use((req, res, next) => {
  res.status(404).json({ error: "Route Not Found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server running on port ${PORT}`);
});
