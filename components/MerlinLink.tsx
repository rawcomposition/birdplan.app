import clsx from "clsx";

type MerlinLinkPropsT = {
  children: React.ReactNode;
  className?: string;
  code: string;
};

export default function MerlinkLink({ code, children, className }: MerlinLinkPropsT) {
  return (
    <>
      <a href={`https://ebird.org/species/${code}`} target="_blank" className={clsx(className, "hidden md:inline")}>
        {children}
      </a>
      <a href={`merlinbirdid://species/${code}'`} target="_blank" className={clsx(className, "md:hidden")}>
        {children}
      </a>
    </>
  );
}
