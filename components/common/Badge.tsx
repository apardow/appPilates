type Props = { text: string; className?: string };

export default function Badge({ text, className = "" }: Props) {
  return (
    <span className={`text-xs px-2 py-1 rounded border uppercase ${className}`}>
      {text}
    </span>
  );
}
