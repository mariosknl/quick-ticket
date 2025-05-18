"use server";

import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";
import { logEvent } from "@/utils/sentry";
import { signAuthToken, setAuthCookie, removeAuthCookie } from "@/lib/auth";

type ResponseResult = {
  success: boolean;
  message: string;
};

// register a new user
export async function registerUser(
  prevState: ResponseResult,
  formData: FormData
): Promise<ResponseResult> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      logEvent(
        "Validation error: Missing registered fields",
        "auth",
        { name, email },
        "warning"
      );
      return { success: false, message: "Missing required fields" };
    }

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logEvent(
        `Validation error: User already exists - ${email}`,
        "auth",
        { email },
        "warning"
      );
      return { success: false, message: "User already exists" };
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // sign and set auth token
    const token = await signAuthToken({ userId: user.id });
    await setAuthCookie(token);

    logEvent(
      `User registered successfully: ${email}`,
      "auth",
      { userId: user.id, email },
      "info"
    );

    return { success: true, message: "Registration successful" };
  } catch (error) {
    logEvent(
      "Unexpected error during registration",
      "auth",
      {},
      "error",
      error
    );
    return {
      success: false,
      message: "Something went wrong, please try again",
    };
  }
}

// Log user out and remove auth cookie
export async function logoutUser(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await removeAuthCookie();

    logEvent("User logged out successfully", "auth", {}, "info");

    return { success: true, message: "Logout Successful" };
  } catch (error) {
    logEvent("Unexpected error during logout", "auth", {}, "error", error);

    return { success: false, message: "Logout failed. Please try again" };
  }
}
