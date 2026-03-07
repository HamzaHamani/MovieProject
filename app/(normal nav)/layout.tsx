import Navbar from "@/components/navbar/navbar";

type Props = {
  children: React.ReactNode;
};

export default function layout({ children }: Props) {
  return (
    <div className="">
      <Navbar type={"normal"} />
      {children}
    </div>
  );
}
