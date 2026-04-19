import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import {useAppDispatch} from "@/shared/hooks/redux.ts";
import { useNavigate, Link } from "react-router";
import { type LoginFormValues, loginSchema} from "@/shared/schemas/auth.schema.ts";
import {loginRequest} from "@/features/auth/api/auth-api.ts";
import { setCredentials } from "@/features/auth/model/auth-slice"
import Input from "@/shared/ui/input";
import Button from "@/shared/ui/button";


export default function LoginForm() {
    const dispatch= useAppDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState : {errors, isSubmitting}
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        try{
            const response = await loginRequest(values);
            const { token, user } = response;

            localStorage.setItem("token", token);
            dispatch(setCredentials({token, user}));
            navigate("/");
        }catch(error){
            console.error("Login failed:", error);
            alert("Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="rounded-2xl border border-border-cream bg-ivory p-6 shadow-whisper">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <Button type="submit" fullWidth loading={isSubmitting}>
                   Sign in
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-charcoal">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-medium text-terracotta underline decoration-terracotta/40 underline-offset-2 hover:text-coral">
                    Register
                </Link>
            </p>
        </div>
    );
}

