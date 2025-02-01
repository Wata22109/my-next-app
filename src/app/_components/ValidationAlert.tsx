"use client";

const ValidationAlert = ({ msg }: { msg: string }) => {
  if (msg === "") {
    return null;
  }
  return (
    <div className="flex items-center space-x-1 text-sm font-bold text-rose-400">
      <div>{msg}</div>
    </div>
  );
};

export default ValidationAlert;
