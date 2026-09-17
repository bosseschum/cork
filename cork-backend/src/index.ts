import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import { app } from "./app.js";

loadEnv({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
