import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../components/Button";
import { useState } from "react";
import { toast } from "react-toastify";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router";

const requestOTPFormSchema = z.object({
  email: z.string().email(),
});
const validateOTPFormSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
});

type RequestOTPFormSchema = z.infer<typeof requestOTPFormSchema>;
type ValidateOTPFormSchema = z.infer<typeof validateOTPFormSchema>;

const AuthPage = () => {
  const {
    register: registerRequestOTPForm,
    handleSubmit: handleSubmitRequestOTPForm,
    formState: {
      errors: errorsRequestOTPForm,
      isSubmitting: isSubmittingRequestOTPForm,
    },
  } = useForm<RequestOTPFormSchema>({
    resolver: zodResolver(requestOTPFormSchema),
  });
  const {
    register: registerValidateOTPForm,
    handleSubmit: handleSubmitValidateOTPForm,
    formState: {
      errors: errorsValidateOTPForm,
      isSubmitting: isSubmittingValidateOTPForm,
    },
    reset: resetValidateOTPForm,
  } = useForm<ValidateOTPFormSchema>({
    resolver: zodResolver(validateOTPFormSchema),
  });
  const { requestOTP, validateOTP } = useAuth();
  const navigate = useNavigate();
  const [emailToValidateOTP, setEmailToValidateOTP] = useState("");

  const onSubmitRequestOTPForm = async ({ email }: RequestOTPFormSchema) => {
    try {
      await requestOTP(email);
      setEmailToValidateOTP(email);
    } catch (error) {
      toast.error(String(error));
    }
  };

  const onSubmitValidateOTPForm = async (data: ValidateOTPFormSchema) => {
    try {
      await validateOTP(data.email, data.otp);
      navigate("/dashboard");
    } catch (error) {
      toast.error(String(error));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-blue-50">
      <div className="w-full max-w-xs">
        <form
          className="relative flex flex-col gap-6 border border-zinc-200 bg-white p-4 shadow"
          onSubmit={
            emailToValidateOTP
              ? handleSubmitValidateOTPForm(onSubmitValidateOTPForm)
              : handleSubmitRequestOTPForm(onSubmitRequestOTPForm)
          }
        >
          <div className="text-blue-500">
            <span className="text-3xl font-bold">Fileship</span>
          </div>
          {emailToValidateOTP ? (
            <div className="flex flex-col gap-2">
              <div className="text-sm break-words text-zinc-600">
                Enter the code sent to{" "}
                <span className="text-blue-500">{emailToValidateOTP}</span>
              </div>
              <div className="fixed">
                <input
                  defaultValue={emailToValidateOTP}
                  type="hidden"
                  {...registerValidateOTPForm("email")}
                />
              </div>
              <div className="flex flex-col">
                <input
                  className="w-full border border-zinc-200 bg-white p-2 text-sm outline-none focus:ring focus:ring-blue-300"
                  placeholder="OTP Code"
                  {...registerValidateOTPForm("otp")}
                />
                <div className="text-xs text-rose-400">
                  {errorsValidateOTPForm.otp?.message && (
                    <p>{errorsValidateOTPForm.otp?.message}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="text-sm text-zinc-600">
                To continue, please enter your email.
              </div>
              <div className="flex flex-col">
                <input
                  className="w-full border border-zinc-200 bg-white p-2 text-sm outline-none focus:ring focus:ring-blue-300"
                  placeholder="Email"
                  {...registerRequestOTPForm("email")}
                />
                <div className="text-xs text-rose-400">
                  {errorsRequestOTPForm.email?.message && (
                    <p>{errorsRequestOTPForm.email?.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <Button
            isLoading={
              isSubmittingRequestOTPForm || isSubmittingValidateOTPForm
            }
          >
            Continue
          </Button>
          {emailToValidateOTP && (
            <div className="absolute inset-x-0 -bottom-6 flex items-center justify-center">
              <a
                className="cursor-pointer text-center text-sm text-blue-500 underline"
                onClick={() => {
                  setEmailToValidateOTP("");
                  resetValidateOTPForm();
                }}
              >
                This is not my email
              </a>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
