import { Hono } from "hono";

const users = new Hono();

users.get("/", (c) => c.text("List Users"));

export default users;
