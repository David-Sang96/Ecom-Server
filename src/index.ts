import { app } from "./app";
import { connectDB } from "./config/db";
import { ENV_VARS } from "./config/envVars";

const PORT = ENV_VARS.PORT || 4200;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is listening on PORT: ${PORT}`);
});
