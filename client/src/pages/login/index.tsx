import LoginForm  from "@/features/auth/ui/login-form"

export default function LoginPage() {
    return (
        <div className="mx-auto flex min-h-[calc(100vh - 100px)] max-w-md items-center px-4 py-10">
          <div className="w-full">
              <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
                  Welcome back
              </h1>
              <p className="mb-6 text-center text-gray-600">
                  Sign to continue writing and reading
              </p>
               <LoginForm />
          </div>
        </div>
    )
}