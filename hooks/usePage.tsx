import { useContext } from "react";
import { GlobalContext } from "@/context/globalContext";

const usePage = () => {
  const { page, setPage } = useContext(GlobalContext);
  function nextPage() {
    setPage(page + 1);
  }
  function prevPage() {
    setPage(page - 1);
  }

  return {
    page,
    setPage,
    nextPage,
    prevPage,
  };
};

export default usePage;
