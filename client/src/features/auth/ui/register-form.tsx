import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import {
    registerSchema,
    type RegisterFormValues,
} from "@/shared/schemas/auth.schema";
import Input from "@/shared/ui/input";
import Button from "@/shared/ui/button";
import { registerRequest } from "@/features/auth/api/auth-api";
import { useAppDispatch } from "@/shared/hooks/redux";
import { setCredentials } from "@/features/auth/model/auth-slice";
import { useState } from "react";
import axios from "axios";

export default function RegisterForm() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    const [submitError, setSubmitError] = useState("");

    const onSubmit = async (values: RegisterFormValues) => {
        try {
            setSubmitError("");

            const response = await registerRequest(values);
            const { token, user } = response;

            localStorage.setItem("token", token);
            dispatch(setCredentials({ token, user }));
            navigate("/");
        } catch (error) {
            console.error("Register failed:", error);

            if (axios.isAxiosError(error)) {
                const message =
                    error.response?.data?.message ||
                    (error.response ? "Register failed. Please try again." : "Network error, please try again.");

                setSubmitError(message);
                return;
            }

            setSubmitError("Register failed. Please try again.");
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label="Username"
                    type="text"
                    placeholder="Choose a username"
                    error={errors.username?.message}
                    {...register("username")}
                />

                <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="Create a password"
                    error={errors.password?.message}
                    {...register("password")}
                />

                {submitError && (
                    <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                        {submitError}
                    </div>
                )}
                <Button type="submit" fullWidth loading={isSubmitting}>
                    Create account
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-green-600 hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}