import Navbar from "@/components/navbar/navbar";

type Props = {
  children: React.ReactNode;
};

export default function layout({ children }: Props) {
  return (
    <div className="font-chillax">
      <Navbar type={"transparent"} />
      {children}
    </div>
  );
}
