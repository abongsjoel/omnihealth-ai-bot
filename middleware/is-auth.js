const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(500).json({ error: "Token verification failed" });
  }

  if (!decodedToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  req.careTeamId = decodedToken.id;
  next();
};
