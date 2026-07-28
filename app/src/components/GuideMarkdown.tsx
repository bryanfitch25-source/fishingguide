import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function GuideMarkdown({ children }: { children: string }) {
  return (
    <div className="prose-guide">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
