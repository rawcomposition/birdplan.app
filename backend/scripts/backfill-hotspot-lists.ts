import { connect, User, HotspotList } from "lib/db.js";
import { DEFAULT_LIST_NAME } from "lib/users.js";

const run = async () => {
  await connect();
  const userIds = await User.find().distinct("_id");
  const withList = new Set(await HotspotList.find({ userId: { $in: userIds } }).distinct("userId"));
  const missing = userIds.filter((id) => !withList.has(id));
  if (missing.length) {
    await HotspotList.insertMany(missing.map((userId) => ({ userId, name: DEFAULT_LIST_NAME })));
  }
  console.log(`Created ${missing.length} lists for ${userIds.length} users`);
  process.exit(0);
};

run();
