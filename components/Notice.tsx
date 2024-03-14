import Link from "next/link";
import CloseButton from "components/CloseButton";
import { useProfile } from "providers/profile";

const noticeId = "";

export default function Notice() {
  const { id, dismissNotice, dismissedNoticeId } = useProfile();

  const handleDismiss = () => {
    dismissNotice(noticeId);
  };

  if (!noticeId) return null;
  if (!id) return null;
  if (dismissedNoticeId === noticeId) return null;

  return (
    <div className="bg-white border-l-4 border-blue-500 p-4 mb-8">
      <div className="flex items-start justify-between gap-4">
        <p className="text-gray-700">
          <span className="font-bold">Heads up!</span> The eBird taxonomy was recently updated.
          <br />
          Be sure to{" "}
          <Link href="/import-lifelist" className="text-blue-600 font-bold">
            re-import your life list
          </Link>{" "}
          and targets for any upcoming trips.
        </p>
        <CloseButton onClick={handleDismiss} />
      </div>
    </div>
  );
}
