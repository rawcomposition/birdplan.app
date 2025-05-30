import { authenticate, APIError } from "lib/api";
import { connect, Profile } from "lib/db";
import { auth } from "lib/firebaseAdmin";

export async function GET(request: Request) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    let [profile] = await Promise.all([
      Profile.findOne({ uid: session.uid }).lean(),
      Profile.updateOne({ uid: session.uid }, { lastActiveAt: new Date() }),
    ]);

    if (!profile) {
      const user = await auth.getUser(session.uid);
      const newProfile = await Profile.create({ uid: session.uid, name: user.displayName, email: user.email });
      profile = newProfile.toObject();
    }

    if (!profile.name) {
      const user = await auth.getUser(session.uid);
      if (user.displayName) {
        await Profile.updateOne({ uid: session.uid }, { name: user.displayName });
        profile = { ...profile, name: user.displayName };
      }
    }
    return Response.json(profile);
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error loading profile", 500);
  }
}

type BodyT = {
  lifelist?: string[];
  exceptions?: string[];
  dismissedNoticeId?: string;
};

export async function PATCH(request: Request) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();

    const data: BodyT = await request.json();
    const allowedFields: string[] = ["lifelist", "exceptions", "dismissedNoticeId"];
    Object.keys(data).forEach((key) => {
      if (!allowedFields.includes(key) || !data[key as keyof BodyT]) {
        delete data[key as keyof BodyT];
      }
    });

    if (data.lifelist) {
      const sciNames = data.lifelist;
      const response = await fetch(
        `https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
      );
      const taxonomy: eBirdResponse = await response.json();

      const codes = sciNames
        .map((name: string) => {
          return taxonomy.find((taxon) => taxon.sciName === name)?.speciesCode;
        })
        .filter((code) => code);

      await Profile.updateOne({ uid: session.uid }, { ...data, lifelist: codes });
    } else {
      await Profile.updateOne({ uid: session.uid }, data);
    }

    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error updating profile", 500);
  }
}

type eBirdResponse = {
  speciesCode: string;
  sciName: string;
}[];
