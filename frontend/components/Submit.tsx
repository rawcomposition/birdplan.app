import Button from "components/Button";

type Props = {
  loading: boolean;
  children: React.ReactNode;
  [key: string]: any;
};

export default function Submit({ loading, children, ...props }: Props) {
  return (
    <Button type="submit" {...props}>
      {loading ? "..." : children}
    </Button>
  );
}
