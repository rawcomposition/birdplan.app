import { Alert, AlertDescription } from "components/ui/alert";
import Icon from "components/Icon";
import EbirdDownloadLink from "components/EbirdDownloadLink";
import { LifelistCsvErrorKind } from "lib/lifelistCsv";

const messages: Record<LifelistCsvErrorKind, string> = {
  dataDownload: "That looks like eBird’s “Download My Data” export. Upload your eBird life list CSV instead.",
  unrecognized: "We couldn’t read that file. Make sure it’s a life list CSV exported from eBird.",
};

export default function LifelistUploadError({ kind, world }: { kind: LifelistCsvErrorKind; world?: boolean }) {
  return (
    <Alert variant="destructive">
      <Icon name="warning" />
      <AlertDescription>
        {messages[kind]} <EbirdDownloadLink world={world} />
      </AlertDescription>
    </Alert>
  );
}
