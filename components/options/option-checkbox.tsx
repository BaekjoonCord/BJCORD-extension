export default function OptionCheckbox({
  name,
  children,
}: {
  name: string;
  children: string;
}) {
  return (
    <div className="flex gap-2 items-center">
      <input type="checkbox" className="w-4 h-4" id={name} />
      <label htmlFor={name}>{children}</label>
    </div>
  );
}
