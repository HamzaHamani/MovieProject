import React from "react";

type Props = {};

export default function Logo({}: Props) {
  return (
    <div className="w-[39px] h-[39px] s:w-[30px] ">
      <img src="/logo.svg" />
    </div>
  );
}
