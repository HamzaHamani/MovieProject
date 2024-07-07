import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

type Props = {};

export default function AddListButton({}: Props) {
  return (
    <Button
      variant={"outline"}
      className="flex items-center gap-2 border-gray-300 bg-transparent xsmd:text-xs"
    >
      <span>
        <PlusCircle />
      </span>{" "}
      <span className="sss:hidden">Add List</span>
    </Button>
  );
}
