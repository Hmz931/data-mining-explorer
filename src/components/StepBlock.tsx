import { ReactNode } from "react";

interface Props {
  number: string | number;
  title: string;
  children: ReactNode;
}

export const StepBlock = ({ number, title, children }: Props) => (
  <div className="my-8 grid grid-cols-[auto_1fr] gap-5 md:gap-7">
    <div className="flex flex-col items-center">
      <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-semibold shadow-ink">
        {number}
      </div>
      <div className="w-px flex-1 bg-border mt-3" />
    </div>
    <div className="pb-6">
      <h3 className="font-serif text-xl md:text-2xl font-semibold text-primary mb-3">{title}</h3>
      <div className="text-foreground/85 leading-relaxed [&_p]:mb-4">{children}</div>
    </div>
  </div>
);
