import { model, Schema } from "mongoose";

type ROLE = "ADMIN" | "USER";

interface IUser {
  name: string;
  email: string;
  password: string;
  role: ROLE;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, min: 5 },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "USER", required: true },
});

export const USER = model<IUser>("USER", userSchema);
