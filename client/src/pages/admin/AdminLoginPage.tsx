import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Flower2, LockKeyhole } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { authClient, hasAdminRole } from "../../lib/auth-client";
import { loginFormSchema } from "../../validations/admin-forms";
import type { LoginFormValues } from "../../validations/admin-forms";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: existing, isPending } = authClient.useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });
  if (!isPending && existing && hasAdminRole(existing.user.role)) return <Navigate to="/admin/dashboard" replace />;

  async function onSubmit(values: LoginFormValues) {
    setErrorText("");
    try {
      const response = await authClient.signIn.email({ email: values.email, password: values.password });
      if (response.error) {
        setErrorText(response.error.message || "Invalid email or password.");
        return;
      }
      const result = await authClient.getSession();
      if (result.error || !result.data) {
        setErrorText("Login succeeded but the session could not be verified. Try refreshing.");
        return;
      }
      if (!hasAdminRole(result.data.user.role)) {
        setErrorText("This account does not have administrator access.");
        return;
      }
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from?.startsWith("/admin/") && from !== "/admin/login" ? from : "/admin/dashboard", { replace: true });
    } catch {
      setErrorText("Login could not reach the server. Check your connection and try again.");
    }
  }

  return (
    <main className="admin-login">
      <section className="admin-login__visual" aria-hidden="true">
        <span className="admin-login__brand"><Flower2 size={27}/> Learnora</span>
        <div className="admin-login__visual-copy">
          <span className="admin-eyebrow admin-eyebrow--light">THE LEARNING STUDIO</span>
          <h2>Shape better <em>learning.</em></h2>
          <p>A considered workspace for building and organizing meaningful courses.</p>
        </div>
        <span className="admin-login__visual-index">01 / ADMIN ACCESS</span>
      </section>
      <section className="admin-login__panel">
        <Link to="/" className="admin-login__back"><ArrowLeft size={16}/> Return to website</Link>
        <div className="admin-login__form-wrap">
          <div className="admin-login__icon"><LockKeyhole size={26}/></div>
          <span className="admin-eyebrow">SECURE SIGN IN</span>
          <h1>Welcome <em>back.</em></h1>
          <p className="admin-login__intro">Enter your administrator credentials to manage courses and lectures.</p>
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="admin-form admin-login__form">
            <div className="admin-field">
              <label htmlFor="admin-email">Email address</label>
              <input id="admin-email" autoComplete="username" type="email" placeholder="admin@example.com" aria-invalid={!!errors.email} {...register("email")}/>
              {errors.email && <span className="admin-field__error">{errors.email.message}</span>}
            </div>
            <div className="admin-field">
              <label htmlFor="admin-password">Password</label>
              <div className="admin-password-wrap">
                <input id="admin-password" autoComplete="current-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" aria-invalid={!!errors.password} {...register("password")}/>
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              </div>
              {errors.password && <span className="admin-field__error">{errors.password.message}</span>}
            </div>
            {errorText && <div className="admin-alert admin-alert--error" role="alert">{errorText}</div>}
            <button type="submit" className="admin-btn admin-btn--primary admin-login__submit" disabled={isSubmitting || isPending}>
              {isSubmitting ? "Signing in…" : "Sign in to dashboard"} <ArrowRight size={17}/>
            </button>
          </form>
          <p className="admin-login__note">Administrator access only. Public registration is disabled.</p>
        </div>
      </section>
    </main>
  );
}
