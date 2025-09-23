import cn from "@yeahx4/cn";

export default function OptionInput({
  placeholder,
  className,
  value,
  onChange,
}: {
  placeholder?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      placeholder={placeholder}
      className={cn(
        className,
        "py-2 px-3 outline-none bg-[#2c2f33] rounded-sm h-full"
      )}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
