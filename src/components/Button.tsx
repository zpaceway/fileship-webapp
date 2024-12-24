import { forwardRef } from "react";
import { CgSpinner } from "react-icons/cg";
import { twMerge } from "tailwind-merge";

const buttonVariantColorMapping = {
  primary: "bg-blue-500 hover:bg-blue-600/90 active:bg-blue-600",
  secondary: "bg-purple-500 hover:bg-purple-600/90 active:bg-purple-600",
  error: "bg-red-500 hover:bg-red-600/90 active:bg-red-600",
  tertiary: "bg-amber-500 hover:bg-amber-600/90 active:bg-amber-600",
};

type ButtonProps = {
  isLoading?: boolean;
  variant?: keyof typeof buttonVariantColorMapping;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, variant = "primary", disabled, isLoading, className, ...rest },
    ref,
  ) => {
    return (
      <div className="bg-white">
        <button
          disabled={disabled || isLoading}
          ref={ref}
          className={twMerge(
            "relative w-full px-4 py-2 text-white transition-all",
            buttonVariantColorMapping[variant],
            disabled || isLoading ? "opacity-50" : "cursor-pointer",
            className,
          )}
          {...rest}
        >
          <div className={isLoading ? "opacity-0" : "opacity-100"}>
            {children}
          </div>
          {isLoading && (
            <div className="h-h-full absolute inset-0 flex w-full items-center justify-center">
              <CgSpinner className="animate-spin" />
            </div>
          )}
        </button>
      </div>
    );
  },
);

export default Button;
