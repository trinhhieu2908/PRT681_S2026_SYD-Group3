import ReactMarkdown from "react-markdown";

type MessageTextProps = {
  message: string;
  className?: string;
};

export default function MessageText({ message, className }: MessageTextProps) {
  return (
    <p className={className}>
      <ReactMarkdown
        components={{
          // prevent react-markdown from wrapping text in its own <p>
          p: ({ node, ...props }) => <>{props.children}</>,
        }}
      >
        {message}
      </ReactMarkdown>
    </p>
  );
}
