import { InlineMath, BlockMath } from "react-katex";

export const M = ({ children }: { children: string }) => <InlineMath math={children} />;
export const BM = ({ children }: { children: string }) => (
  <div className="my-6 overflow-x-auto py-2 px-4 rounded-md bg-surface/60 border border-border">
    <BlockMath math={children} />
  </div>
);
