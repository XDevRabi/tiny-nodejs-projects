import path from "path";
import express from "express";
import { shortnerRoutes } from "./routes/shortner.routes.js"; // To import all the routes for the port 3001

const app = express();
const PORT = process.env.PORT || 3001;
app.use(shortnerRoutes);

// Middlewares
const staticFilesPath = path.join(import.meta.dirname, "public");
app.use(express.static(staticFilesPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
