import { forwardRef } from "react";
import { CgSpinner } from "react-icons/cg";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  isLoading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, isLoading, className, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          "relative w-full cursor-pointer bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600/90 active:bg-blue-600",
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
