import cn from "@yeahx4/cn";

export default function OptionInput({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      placeholder={placeholder}
      className={cn(
        className,
        "p-2 outline-none bg-[#2c2f33] rounded-sm h-full"
      )}
    />
  );
}
