import { forwardRef } from "react";
import { CgSpinner } from "react-icons/cg";
import { twMerge } from "tailwind-merge";

const buttonVariantColorMapping = {
  primary: "bg-blue-500",
  secondary: "bg-purple-500",
  tertiary: "bg-amber-500",
};

type ButtonProps = {
  isLoading?: boolean;
  variant?: "primary" | "secondary";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, variant = "primary", disabled, isLoading, className, ...rest },
    ref,
  ) => {
    return (
      <button
        disabled={disabled || isLoading}
        ref={ref}
        className={twMerge(
          "relative w-full cursor-pointer px-4 py-2 text-white transition-all hover:bg-blue-600/90 active:bg-blue-600",
          buttonVariantColorMapping[variant],
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
    );
  },
);

export default Button;
