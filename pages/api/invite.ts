import type { NextApiRequest, NextApiResponse } from "next";
import { db, auth } from "lib/firebaseAdmin";
import { sendInviteEmail } from "lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { email, tripId } = req.body;

    const token = req.headers.authorization as string;

    const result = await auth.verifyIdToken(token || "");
    if (!token || !result.uid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const trip = await db.collection("trip").doc(tripId).get();
    const tripData = trip.data();
    if (!tripData) throw new Error("Trip not found");
    if (tripData.ownerId !== result.uid) throw new Error("Unauthorized");

    const invite = await db.collection("invite").add({
      email,
      tripId,
      ownerId: result.uid,
      accepted: false,
    });

    await sendInviteEmail({
      tripName: tripData.name,
      fromName: result.name || "",
      email,
      url: `${process.env.NEXT_PUBLIC_URL}/accept/${invite.id}`,
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
