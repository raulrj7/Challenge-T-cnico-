import express from "express";
import { connectDB } from "./config/database";
import authRoutes from "./auth/routes/auth.routes";
import eventsRutes from "./events/routes/events.routes";
import reservationsRoutes from "./reservations/routes/reservation.routes";
import userRoutes from "./users/routes/user.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rutas
app.use("/auth", authRoutes);
app.use("/events", eventsRutes);
app.use("/reservations", reservationsRoutes);
app.use("/users", userRoutes)

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
};

startServer();
