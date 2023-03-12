type Props = {
  reload: () => void;
};

export default function FetchError({ reload }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="text-3xl font-bold text-slate-500 text-shadow">Well, that didn&apos;t work...</h3>
      <p className="text-gray-700 font-bold">You might have to find your own rare birds ¯\_(ツ)_/¯</p>
      <button type="button" className="text-rose-600/75" onClick={reload}>
        Try Again
      </button>
    </div>
  );
}
