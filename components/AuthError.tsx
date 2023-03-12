type Props = {
  children: React.ReactNode;
};

export default function AuthError({ children }: Props) {
  return <div className="w-full py-4 text-sm text-red-700">{children}</div>;
}
