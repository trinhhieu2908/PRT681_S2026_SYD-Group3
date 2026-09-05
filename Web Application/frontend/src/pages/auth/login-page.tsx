import logoText from "../../../assets/logo-text.png";
import logo from "../../../assets/logo.png";
import LoginForm from "@/modules/auth/components/login-form";
import RegisterForm from "@/modules/auth/components/register-form";
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  MailCheck,
} from "lucide-react";
import { useState } from "react";

const currentYear = new Date().getFullYear();

const stages = [
  { label: "Apply", icon: ClipboardList },
  { label: "Interview", icon: CalendarCheck },
  { label: "Follow up", icon: MailCheck },
];

type AuthMode = "login" | "register";

interface LoginCardProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

const LoginCard = ({ mode, onModeChange }: LoginCardProps) => {
  const isLogin = mode === "login";

  return (
    <div className="w-full max-w-[448px] rounded-lg border border-slate-200 bg-white p-6 text-slate-950 shadow-2xl shadow-slate-950/15 sm:p-8">
      <div className="mb-8">
        <img
          src={logo}
          alt="JobTrack"
          className="mb-6 h-14 w-14 object-contain"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-700">
          {isLogin ? "Welcome back" : "Get started"}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          {isLogin ? "Sign in to JobTrack" : "Create your account"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {isLogin
            ? "Continue managing your opportunities."
            : "Choose an email and password to join JobTrack."}
        </p>
      </div>

      {isLogin ? (
        <LoginForm />
      ) : (
        <RegisterForm onRegistered={() => onModeChange("login")} />
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        {isLogin ? "New to JobTrack?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => onModeChange(isLogin ? "register" : "login")}
          className="font-semibold text-primary-700 transition hover:text-primary-900 hover:underline"
        >
          {isLogin ? "Create an account" : "Sign in"}
        </button>
      </p>

      <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-6 text-sm text-slate-600">
        <CheckCircle2 className="h-4 w-4 text-primary-600" />
        Connected to the JobTrack API
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="relative min-h-screen bg-white text-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[52vh] bg-[linear-gradient(90deg,#0f766e_0%,#134e4a_52%,#1e1b4b_100%)] lg:h-1/2" />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        <main className="grid lg:min-h-screen lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="flex min-h-[52vh] items-center bg-transparent px-5 py-10 text-white sm:px-8 lg:min-h-0 lg:px-12 xl:px-16">
            <div className="w-full max-w-2xl">
              <img
                src={logoText}
                alt="JobTrack"
                className="h-20 w-20 rounded-lg bg-white object-contain p-2 shadow-lg shadow-slate-950/10 sm:h-24 sm:w-24"
              />
              <p className="mt-4 text-base font-medium text-white/75 sm:text-lg">
                Career pipeline
              </p>
              <h1 className="mt-6 max-w-[620px] text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl xl:text-5xl">
                Stay on top of every application without the chaos.
              </h1>
            </div>
          </section>

          <section className="flex min-h-[48vh] items-center bg-white px-5 py-10 sm:px-8 lg:min-h-0 lg:bg-transparent lg:px-12 xl:px-16">
            <div className="w-full max-w-2xl">
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                JobTrack helps you manage applications, interviews, and
                follow-ups from one calm workspace.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {stages.map((stage, index) => {
                  const Icon = stage.icon;

                  return (
                    <div
                      key={stage.label}
                      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/5"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                        <Icon size={20} />
                      </div>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Step {index + 1}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        {stage.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <footer className="mt-8 flex flex-col gap-1 border-t border-slate-200 pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>© {currentYear} JobTrack</p>
                <p>One place for every opportunity.</p>
              </footer>
            </div>
          </section>
        </main>

        <aside className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-8 lg:bg-transparent lg:py-16">
          <LoginCard mode={mode} onModeChange={setMode} />
        </aside>
      </div>
    </div>
  );
};

export default LoginPage;
