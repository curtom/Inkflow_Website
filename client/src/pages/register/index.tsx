import RegisterForm from "@/features/auth/ui/register-form";

export default function RegisterPage() {
    return (
        <div className="mx-auto flex min-h-[calc(100vh - 160px)] max-w-md items-center px-4 py-10">
            <div className="w-full">
                <h1 className="mb-2 text-center text-3xl font-medium text-ink">
                    Create your account
                </h1>
                <p className="mb-6 text-center text-charcoal">
                    Join InkFlow and start sharing your ideas.
                </p>
                  <RegisterForm />
            </div>
        </div>
    );
}