import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../models/users.model";

export const authService = {
  async register(name: string, email: string, password: string) {
    email = email.toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, message: "Email is already registered" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    return { success: true, message: "User registered successfully" };
  },

  async login(email: string, password: string) {
    email = email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: "Invalid credentials" };
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" }
    );

    return { success: true, token };
  }
};
