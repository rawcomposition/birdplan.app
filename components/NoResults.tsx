type Props = {
  reload: () => void;
};

export default function NoResults({ reload }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <img className="bg-white rounded-full object-contain w-64 h-64 mx-auto my-6" src="/no-results.gif" />
      <h3 className="text-3xl font-bold text-slate-500 text-shadow">
        We couldn&apos;t find <em>anything!</em>
      </h3>
      <p className="text-gray-700 font-bold">Try increasing your radius</p>
      <button type="button" className="text-rose-600/75" onClick={reload}>
        Try Again
      </button>
    </div>
  );
}
