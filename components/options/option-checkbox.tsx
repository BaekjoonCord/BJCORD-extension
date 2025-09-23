export default function OptionCheckbox({
  name,
  children,
  checked,
  onChange,
}: {
  name: string;
  children: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="checkbox"
        className="w-4 h-4"
        id={name}
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={name}>{children}</label>
    </div>
  );
}
