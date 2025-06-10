import { Hono } from "hono";
import profile from "./profile.js";

const account = new Hono();

account.route("/profile", profile);

export default account;
