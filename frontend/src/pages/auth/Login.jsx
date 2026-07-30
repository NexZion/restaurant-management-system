import { useState, useEffect, useRef } from "react";
import {
  TextField,
  CheckboxField,
  Button,
  ToggleSwitch,
} from "../../components/DataFields";
import { useTheme } from "../../context/ThemeContext";
import logoImage from "../../assets/logo.png";
import api from "../../axiosClient";
import { useNavigate } from "react-router-dom";
import { getStoredUser, isSessionValid, saveAuthSession } from "../../utils/authStorage";
import { defaultRouteForLevel, getAccessLevel } from "../../utils/accessControl";
import { Dialog } from "../../components/Popups";

const LoginInteractiveBackground = ({ isDark }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frameId;
    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const onPointerMove = (event) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const onPointerLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);

    const draw = () => {
      const palette = isDark
        ? {
            bg: "#0b0d12",
            line: "rgba(96, 165, 250, 0.14)",
            lineActive: "rgba(96, 165, 250, 0.34)",
            point: "rgba(148, 163, 184, 0.26)",
            pointActive: "rgba(147, 197, 253, 0.85)",
            wash: "rgba(23, 26, 33, 0.82)",
          }
        : {
            bg: "#f6f7fb",
            line: "rgba(37, 99, 235, 0.11)",
            lineActive: "rgba(37, 99, 235, 0.24)",
            point: "rgba(100, 116, 139, 0.22)",
            pointActive: "rgba(37, 99, 235, 0.68)",
            wash: "rgba(255, 255, 255, 0.62)",
          };

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, palette.wash);
      gradient.addColorStop(0.45, "rgba(255,255,255,0)");
      gradient.addColorStop(1, palette.wash);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const gap = width < 640 ? 42 : 56;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let y = -gap; y <= height + gap; y += gap) {
        ctx.beginPath();
        for (let x = -gap; x <= width + gap; x += gap) {
          const dx = x - mx;
          const dy = y - my;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const pull = Math.max(0, 1 - distance / 230);
          const wave = Math.sin(x * 0.012 + y * 0.007 + time) * 5;
          const lift = pull * 18;
          const px =
            x + Math.cos(time + y * 0.01) * 3 + (dx / Math.max(distance, 1)) * lift;
          const py = y + wave + (dy / Math.max(distance, 1)) * lift;

          if (x === -gap) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.strokeStyle = palette.line;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let x = -gap; x <= width + gap; x += gap) {
        ctx.beginPath();
        for (let y = -gap; y <= height + gap; y += gap) {
          const dx = x - mx;
          const dy = y - my;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const pull = Math.max(0, 1 - distance / 230);
          const wave = Math.cos(x * 0.008 + y * 0.011 + time) * 4;
          const lift = pull * 14;
          const px = x + wave + (dx / Math.max(distance, 1)) * lift;
          const py =
            y + Math.sin(time + x * 0.01) * 2 + (dy / Math.max(distance, 1)) * lift;

          if (y === -gap) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.strokeStyle = palette.line;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let x = -gap; x <= width + gap; x += gap) {
        for (let y = -gap; y <= height + gap; y += gap) {
          const dx = x - mx;
          const dy = y - my;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const active = Math.max(0, 1 - distance / 190);
          const r = 1.4 + active * 2.6;
          ctx.beginPath();
          ctx.arc(x, y + Math.sin(time + x * 0.01) * 3, r, 0, Math.PI * 2);
          ctx.fillStyle = active > 0 ? palette.pointActive : palette.point;
          ctx.fill();
        }
      }

      if (mx > -100) {
        ctx.beginPath();
        ctx.arc(mx, my, 118, 0, Math.PI * 2);
        ctx.strokeStyle = palette.lineActive;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      time += 0.006;
      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 block h-full w-full"
    />
  );
};

export const Login = ({ initialPinMode = false }) => {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [pinMode, setPinMode] = useState(initialPinMode);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const [toggle2, setToggle2] = useState(isDarkMode);

  useEffect(() => {
    if (toggle2 !== isDarkMode) {
      toggleTheme();
    }
  }, [isDarkMode, toggle2, toggleTheme]);

  useEffect(() => {
    if (isSessionValid()) {
      navigate(defaultRouteForLevel(getAccessLevel(getStoredUser())), { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setSubmitting(true);
    try {
      const response = await api.post(
        pinMode ? "auth/login/pin" : "auth/login",
        pinMode ? { pin } : { login, password, rememberMe },
      );
      saveAuthSession({
        token: response.data.token,
        user: response.data.user,
        rememberMe: pinMode ? false : rememberMe,
      });
      navigate(defaultRouteForLevel(getAccessLevel(response.data.user)), { replace: true });
    } catch (error) {
      setLoginError(
        Object.values(error?.response?.data?.errors || {}).flat().join(" ") ||
          error?.response?.data?.message ||
          "Login failed. Check your credentials and API connection.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 p-6 dark:bg-[#0b0d12]">
      <LoginInteractiveBackground isDark={isDarkMode} />

      <div className="relative z-20 w-full max-w-[430px]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white/90 shadow-2xl shadow-slate-200/70 backdrop-blur-xl dark:border-[#252a35] dark:bg-[#111318]/92 dark:shadow-black/40">
          <div className="border-b border-slate-100 px-7 py-4 dark:border-[#252a35]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Welcome back
              </span>
              <ToggleSwitch
                checked={toggle2}
                onChange={(e) => setToggle2(e.target.checked)}
                size="small"
                checkedColor="#3b82f6"
                uncheckedColor="#94a3b8"
                leftIcon={
                  <svg
                    className="h-full w-full text-slate-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                }
                rightIcon={
                  <svg
                    className="h-full w-full text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              />
            </div>
          </div>

          <div className="px-7 pb-8 pt-8 sm:px-9">
            <div className="mb-8 flex justify-center">
              <img
                src={logoImage}
                alt="Logo"
                className="h-14 invert dark:invert-0"
              />
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                Sign in
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Please enter your details to sign in
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-[#171a21]">
                {[
                  [false, "Password"],
                  [true, "Staff PIN"],
                ].map(([mode, label]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setPinMode(mode);
                      setLoginError("");
                    }}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                      pinMode === mode
                        ? "bg-white text-blue-600 shadow-sm dark:bg-[#252a35] dark:text-blue-300"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {pinMode ? (
                <div className="space-y-4">
                  <div className="flex justify-center gap-3 py-2" aria-label="PIN value">
                    {[0, 1, 2, 3].map((index) => (
                      <span key={index} className={`size-4 rounded-full border-2 ${pin.length > index ? "border-blue-600 bg-blue-600" : "border-slate-300 dark:border-slate-600"}`} />
                    ))}
                  </div>
                  <div className="mx-auto grid max-w-[260px] grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                      <button key={number} type="button" onClick={() => setPin((current) => `${current}${number}`.slice(0, 4))} className="rounded-lg border border-slate-200 bg-white py-3 text-lg font-bold hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-[#171a21]">{number}</button>
                    ))}
                    <button type="button" onClick={() => setPin("")} className="rounded-lg border border-slate-200 py-3 text-sm font-semibold text-slate-500 dark:border-slate-700">Clear</button>
                    <button type="button" onClick={() => setPin((current) => `${current}0`.slice(0, 4))} className="rounded-lg border border-slate-200 bg-white py-3 text-lg font-bold dark:border-slate-700 dark:bg-[#171a21]">0</button>
                    <button type="button" onClick={() => setPin((current) => current.slice(0, -1))} className="rounded-lg border border-slate-200 py-3 text-sm font-semibold text-slate-500 dark:border-slate-700">Delete</button>
                  </div>
                </div>
              ) : (
                <>
                  <TextField
                    label="Username / Email"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                  />
                </>
              )}

              {loginError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                >
                  {loginError}
                </div>
              )}

              {!pinMode && <div className="flex items-center justify-between gap-3 text-sm">
                <CheckboxField
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />

                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setShowForgotPassword(true);
                  }}
                  className="font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  Forgot password?
                </a>
              </div>}

              <Button
                type="submit"
                fullWidth
                width="100%"
                className="mt-1"
                disabled={
                  submitting ||
                  (pinMode ? pin.length !== 4 : !login || !password)
                }
              >
                {submitting
                  ? "Signing in…"
                  : pinMode
                    ? "Sign in with PIN"
                    : "Log in"}
              </Button>
            </form>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500">
          (c) 2026 NexZion. All rights reserved.
        </p>
      </div>

      <Dialog
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        title="Forgot password?"
        size="small"
        primaryButtonText="Got it"
        showSecondaryButton={false}
        onPrimaryButtonClick={() => setShowForgotPassword(false)}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Please contact the company support team to reset your password or
            recover access to your account.
          </p>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#252a35] dark:bg-[#171a21]">
            <p className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">
              Contact details
            </p>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Company</span>
                <span className="text-right font-medium text-slate-900 dark:text-white">
                  NexZion
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Email</span>
                <a
                  href="mailto:support@nexzion.com"
                  className="text-right font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  support@nexzion.com
                </a>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Phone</span>
                <span className="text-right font-medium text-slate-900 dark:text-white">
                  Contact your system administrator
                </span>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Login;
