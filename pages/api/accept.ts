import type { NextApiRequest, NextApiResponse } from "next";
import { db, auth } from "lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { inviteId } = req.body;

    const token = req.headers.authorization as string;

    const result = await auth.verifyIdToken(token || "");
    if (!token || !result.uid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const invite = await db.collection("invite").doc(inviteId).get();
    const inviteData = invite.data();
    if (!inviteData) throw new Error("Invite not found");
    if (inviteData.accepted) throw new Error("Invite already accepted");

    await db.collection("invite").doc(inviteId).update({ accepted: true, name: result.name, uid: result.uid });

    const trip = await db.collection("trip").doc(inviteData.tripId).get();
    const tripData = trip.data();
    if (!tripData) throw new Error("Trip not found");

    await db
      .collection("trip")
      .doc(inviteData.tripId)
      .update({ userIds: [...tripData.userIds, result.uid] });

    res.status(200).json({ success: true, tripId: inviteData.tripId });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
