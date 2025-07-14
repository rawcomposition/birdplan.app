import { betterAuth } from "better-auth";
import { connect } from "lib/db.js";
import { BETTER_AUTH_CONFIG } from "lib/config.js";

type UserData = {
  id: string;
  name?: string;
  email?: string;
};

type SessionData = {
  id: string;
  userId: string;
  expiresAt: Date;
};

type TokenData = {
  token: string;
  userId: string;
  expiresAt: Date;
};

const mongoAdapter = {
  async connect() {
    await connect();
  },
  async disconnect() {},
  async createUser(data: UserData) {
    const { Profile } = await import("lib/db.js");
    const user = await Profile.create({
      uid: data.id,
      name: data.name,
      email: data.email,
      lifelist: [],
      exceptions: [],
      lastActiveAt: new Date(),
    });
    return user.toObject();
  },
  async getUser(userId: string) {
    const { Profile } = await import("lib/db.js");
    const user = await Profile.findOne({ uid: userId }).lean();
    return user;
  },
  async getUserByEmail(email: string) {
    const { Profile } = await import("lib/db.js");
    const user = await Profile.findOne({ email }).lean();
    return user;
  },
  async updateUser(userId: string, data: Partial<UserData>) {
    const { Profile } = await import("lib/db.js");
    const user = await Profile.findOneAndUpdate({ uid: userId }, { $set: data }, { new: true }).lean();
    return user;
  },
  async deleteUser(userId: string) {
    const { Profile } = await import("lib/db.js");
    await Profile.deleteOne({ uid: userId });
  },
  async createSession(data: SessionData) {
    const { Profile } = await import("lib/db.js");
    const session = await Profile.findOneAndUpdate(
      { uid: data.userId },
      {
        $set: {
          sessionId: data.id,
          sessionExpires: data.expiresAt,
        },
      },
      { new: true }
    ).lean();
    return session;
  },
  async getSession(sessionId: string) {
    const { Profile } = await import("lib/db.js");
    const user = await Profile.findOne({
      sessionId,
      sessionExpires: { $gt: new Date() },
    }).lean();
    return user ? { id: sessionId, userId: user.uid, expiresAt: user.sessionExpires } : null;
  },
  async deleteSession(sessionId: string) {
    const { Profile } = await import("lib/db.js");
    await Profile.updateOne({ sessionId }, { $unset: { sessionId: "", sessionExpires: "" } });
  },
  async createVerificationToken(data: TokenData) {
    const { Profile } = await import("lib/db.js");
    await Profile.updateOne(
      { uid: data.userId },
      {
        $set: {
          verificationToken: data.token,
          verificationTokenExpires: data.expiresAt,
        },
      }
    );
    return data;
  },
  async getVerificationToken(token: string) {
    const { Profile } = await import("lib/db.js");
    const user = await Profile.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    }).lean();
    return user
      ? {
          token,
          userId: user.uid,
          expiresAt: user.verificationTokenExpires,
        }
      : null;
  },
  async deleteVerificationToken(token: string) {
    const { Profile } = await import("lib/db.js");
    await Profile.updateOne(
      { verificationToken: token },
      { $unset: { verificationToken: "", verificationTokenExpires: "" } }
    );
  },
  async createPasswordResetToken(data: TokenData) {
    const { Profile } = await import("lib/db.js");
    await Profile.updateOne(
      { uid: data.userId },
      {
        $set: {
          resetToken: data.token,
          resetTokenExpires: data.expiresAt,
        },
      }
    );
    return data;
  },
  async getPasswordResetToken(token: string) {
    const { Profile } = await import("lib/db.js");
    const user = await Profile.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    }).lean();
    return user
      ? {
          token,
          userId: user.uid,
          expiresAt: user.resetTokenExpires,
        }
      : null;
  },
  async deletePasswordResetToken(token: string) {
    const { Profile } = await import("lib/db.js");
    await Profile.updateOne({ resetToken: token }, { $unset: { resetToken: "", resetTokenExpires: "" } });
  },
};

export const auth = betterAuth({
  secret: BETTER_AUTH_CONFIG.secret,
  baseUrl: BETTER_AUTH_CONFIG.baseUrl,
  trustedOrigins: BETTER_AUTH_CONFIG.trustedOrigins,
  adapter: mongoAdapter,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: BETTER_AUTH_CONFIG.sessionExpiry,
  },
  email: {
    from: "BirdPlan.app <support@birdplan.app>",
    provider: "resend",
    apiKey: process.env.RESEND_API_KEY,
  },
});
