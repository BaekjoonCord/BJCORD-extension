import cn from "@yeahx4/cn";

export default function ToggleSwitch({
  enabled,
  setEnabled,
  label,
}: {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center space-x-3">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => setEnabled(!enabled)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center",
          "rounded-full transition-colors duration-200",
          enabled ? "bg-blue-500" : "bg-gray-600"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full",
            "bg-white transition-transform duration-200",
            enabled ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
      <span className="text-sm text-gray-200">{label}</span>
    </div>
  );
}
