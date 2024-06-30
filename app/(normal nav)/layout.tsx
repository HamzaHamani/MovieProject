import Navbar from "@/components/navbar/navbar";

type Props = {
  children: React.ReactNode;
};

export default function layout({ children }: Props) {
  return (
    <div>
      <Navbar type={"normal"} />
      {children}
    </div>
  );
}
