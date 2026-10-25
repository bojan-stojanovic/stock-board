// src/components/ui/ErrorState.tsx
interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer rounded font-medium underline underline-offset-2 transition hover:text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Try again
        </button>
      )}
    </div>
  );
}