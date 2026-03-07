"use client";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  error: any;
};
const Toast: React.FC<Props> = ({ error }) => {
  const [toastDisplayed, setToastDisplayed] = useState(false);

  if (error && !toastDisplayed) {
    toast.error("we couldn't log you in");
    setToastDisplayed(true);
  }

  return null; // Replace with your actual JSX for the Toast component
};
export default Toast;
