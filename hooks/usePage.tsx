import { useContext } from "react";
import { GlobalContext } from "@/context/globalContext";

const usePage = () => {
  const { page, setPage } = useContext(GlobalContext);

  return {
    page,
    setPage,
    nextPage: () => setPage(page + 1),
    prevPage: () => setPage(page - 1),
  };
};

export default usePage;
