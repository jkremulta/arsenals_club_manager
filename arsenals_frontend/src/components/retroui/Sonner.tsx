"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      toastOptions={{
        classNames: {
          toast:
            "h-auto text-sm w-full p-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group toast flex items-center relative bg-card text-[#e8d9b5]",
          description:
            "group-[.toast]:text-[#e8d9b5]/70 ml-2 text-sm font-sans",
          actionButton:
            "py-1 px-2 bg-[#c47a1e] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all ml-auto h-fit min-w-fit font-bold text-sm",
          cancelButton:
            "py-1 px-2 bg-card text-[#e8d9b5] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all ml-auto h-fit min-w-fit font-bold text-sm",
          title: "ml-2 font-sans font-bold text-[#e8d9b5]",
          closeButton:
            "absolute bg-card border-2 border-black -top-1 -left-1 rounded-none p-0.5",
        },
        unstyled: true,
      }}
      {...props}
    />
  );
};

export { Toaster };
