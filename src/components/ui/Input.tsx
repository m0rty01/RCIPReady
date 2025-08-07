interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helper,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-base font-medium mb-2 text-gray-200">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`
            block w-full px-4 py-3 rounded-xl
            bg-gray-800/50 border border-gray-600/50
            text-gray-100 placeholder-gray-400
            focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            hover:border-gray-500/50 hover:bg-gray-800/70
            transition-colors duration-200
            text-base
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {helper && !error && (
        <p className="mt-2 text-sm text-gray-400">{helper}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}