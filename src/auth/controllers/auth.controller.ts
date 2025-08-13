import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const result = await authService.register(name, email, password);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error("Error in register:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      if (!result.success) {
        return res.status(401).json({ message: result.message });
      }

      res.json({ token: result.token });
    } catch (err) {
      console.error("Error in login:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
