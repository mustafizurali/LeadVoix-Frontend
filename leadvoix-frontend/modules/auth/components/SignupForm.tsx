"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signupSchema, SignupFormData } from "../schemas/signup.schema";
import { useSignup } from "../hooks/useSignup";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupForm() {
  const signupMutation = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your LeadVoix account</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                placeholder="Full Name"
                {...register("name")}
              />

              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email"
                {...register("email")}
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register("password")}
              />

              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword")}
              />

              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  {...register("terms")}
                  className="mt-1"
                />

                <span>
                  I agree to the Terms & Privacy Policy.
                </span>
              </label>

              {errors.terms && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.terms.message}
                </p>
              )}
            </div>

            {signupMutation.isError && (
              <p className="text-sm text-red-500">
                Unable to create account. Please check your information and try again.
              </p>
            )}

            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full rounded-md bg-black py-2 text-white disabled:opacity-50"
            >
              {signupMutation.isPending ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-black hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}