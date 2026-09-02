const connectDB = require("./config/db");
require("dotenv").config();

const app = require("./app");
const { PORT } = require("./config/config");

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});