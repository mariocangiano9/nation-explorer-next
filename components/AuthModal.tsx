import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Globe, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPasswordForEmail } from '../services/authService';

interface AuthModalProps {
  language: 'it' | 'en' | 'fr' | 'es' | 'de';
  onClose: () => void;
  onSuccess: () => void;
}

const GUEST_LIMIT = 3;

const translations = {
  it: {
    title: 'Accedi a Nation Explorer',
    subtitle: `Hai esplorato ${GUEST_LIMIT} paesi come ospite.`,
    subtitleFree: 'Crea un account gratuito per continuare.',
    google: 'Continua con Google',
    orDivider: 'oppure',
    email: 'Indirizzo email',
    password: 'Password',
    signIn: 'Accedi',
    createAccount: 'Crea account',
    tabSignIn: 'Accedi',
    tabRegister: 'Registrati',
    loadingSignIn: 'Accesso in corso…',
    loadingRegister: 'Registrazione in corso…',
    forgotPassword: 'Password dimenticata?',
    resetTitle: 'Reimposta la tua password',
    resetSubtitle: 'Inserisci la tua email per ricevere un link di reimpostazione.',
    sendResetLink: 'Invia link di reimpostazione',
    sendingResetLink: 'Invio in corso…',
    resetSuccess: 'Controlla la tua email per il link di reimpostazione.',
    backToLogin: 'Torna al login',
  },
  en: {
    title: 'Sign in to Nation Explorer',
    subtitle: `You've explored ${GUEST_LIMIT} countries as a guest.`,
    subtitleFree: 'Create a free account to keep exploring.',
    google: 'Continue with Google',
    orDivider: 'or',
    email: 'Email address',
    password: 'Password',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    tabSignIn: 'Sign In',
    tabRegister: 'Create Account',
    loadingSignIn: 'Signing in…',
    loadingRegister: 'Creating account…',
    forgotPassword: 'Forgot password?',
    resetTitle: 'Reset your password',
    resetSubtitle: 'Enter your email to receive a reset link.',
    sendResetLink: 'Send reset link',
    sendingResetLink: 'Sending…',
    resetSuccess: 'Check your email for the reset link.',
    backToLogin: 'Back to login',
  },
  fr: {
    title: 'Connectez-vous à Nation Explorer',
    subtitle: `Vous avez exploré ${GUEST_LIMIT} pays en tant qu'invité.`,
    subtitleFree: 'Créez un compte gratuit pour continuer.',
    google: 'Continuer avec Google',
    orDivider: 'ou',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    createAccount: 'Créer un compte',
    tabSignIn: 'Connexion',
    tabRegister: 'Inscription',
    loadingSignIn: 'Connexion en cours…',
    loadingRegister: 'Création en cours…',
    forgotPassword: 'Mot de passe oublié ?',
    resetTitle: 'Réinitialisez votre mot de passe',
    resetSubtitle: 'Entrez votre e-mail pour recevoir un lien de réinitialisation.',
    sendResetLink: 'Envoyer le lien',
    sendingResetLink: 'Envoi en cours…',
    resetSuccess: 'Vérifiez votre e-mail pour le lien de réinitialisation.',
    backToLogin: 'Retour à la connexion',
  },
  es: {
    title: 'Accede a Nation Explorer',
    subtitle: `Has explorado ${GUEST_LIMIT} países como invitado.`,
    subtitleFree: 'Crea una cuenta gratuita para seguir explorando.',
    google: 'Continuar con Google',
    orDivider: 'o',
    email: 'Correo electrónico',
    password: 'Contraseña',
    signIn: 'Iniciar sesión',
    createAccount: 'Crear cuenta',
    tabSignIn: 'Iniciar sesión',
    tabRegister: 'Crear cuenta',
    loadingSignIn: 'Iniciando sesión…',
    loadingRegister: 'Creando cuenta…',
    forgotPassword: '¿Olvidaste tu contraseña?',
    resetTitle: 'Restablece tu contraseña',
    resetSubtitle: 'Ingresa tu email para recibir un enlace de restablecimiento.',
    sendResetLink: 'Enviar enlace',
    sendingResetLink: 'Enviando…',
    resetSuccess: 'Revisa tu email para el enlace de restablecimiento.',
    backToLogin: 'Volver al inicio de sesión',
  },
  de: {
    title: 'Bei Nation Explorer anmelden',
    subtitle: `Sie haben ${GUEST_LIMIT} Länder als Gast erkundet.`,
    subtitleFree: 'Erstellen Sie ein kostenloses Konto, um fortzufahren.',
    google: 'Mit Google fortfahren',
    orDivider: 'oder',
    email: 'E-Mail-Adresse',
    password: 'Passwort',
    signIn: 'Anmelden',
    createAccount: 'Konto erstellen',
    tabSignIn: 'Anmelden',
    tabRegister: 'Registrieren',
    loadingSignIn: 'Wird angemeldet…',
    loadingRegister: 'Wird erstellt…',
    forgotPassword: 'Passwort vergessen?',
    resetTitle: 'Passwort zurücksetzen',
    resetSubtitle: 'Geben Sie Ihre E-Mail ein, um einen Reset-Link zu erhalten.',
    sendResetLink: 'Reset-Link senden',
    sendingResetLink: 'Wird gesendet…',
    resetSuccess: 'Überprüfen Sie Ihre E-Mail für den Reset-Link.',
    backToLogin: 'Zurück zur Anmeldung',
  },
};

type ModalView = 'login' | 'register' | 'forgot';

export const AuthModal = React.memo(function AuthModal({ language, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<ModalView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const tr = translations[language];

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = mode === 'login'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);
      if (error) {
        setError(error.message);
      } else {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await resetPasswordForEmail(resetEmail);
      if (error) {
        setError(error.message);
      } else {
        setResetSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: ModalView) => {
    setMode(next);
    setError(null);
    setResetSent(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm px-4"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

          <AnimatePresence mode="wait" initial={false}>
            {mode === 'forgot' ? (
              /* ── Forgot password view ── */
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.18 }}
              >
                {/* Header */}
                <div className="px-7 pt-7 pb-5 border-b border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <button
                      onClick={() => switchMode('login')}
                      className="text-slate-500 hover:text-slate-300 transition-colors mt-0.5 shrink-0"
                      aria-label={tr.backToLogin}
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe size={18} className="text-blue-400 shrink-0" />
                        <h2 className="text-lg font-bold text-white leading-tight">{tr.resetTitle}</h2>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{tr.resetSubtitle}</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-slate-500 hover:text-slate-300 transition-colors mt-0.5 shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="px-7 py-6">
                  {resetSent ? (
                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                      <CheckCircle2 size={36} className="text-emerald-400" />
                      <p className="text-sm text-slate-300">{tr.resetSuccess}</p>
                      <button
                        onClick={() => switchMode('login')}
                        className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {tr.backToLogin}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400 block">{tr.email}</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={15} />
                          <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all"
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl"
                          >
                            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-400 leading-relaxed">{error}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
                      >
                        {loading ? tr.sendingResetLink : tr.sendResetLink}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            ) : (
              /* ── Login / Register view ── */
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.18 }}
              >
                {/* Header */}
                <div className="px-7 pt-7 pb-5 border-b border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Globe size={18} className="text-blue-400 shrink-0" />
                        <h2 className="text-lg font-bold text-white leading-tight">{tr.title}</h2>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{tr.subtitle} {tr.subtitleFree}</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-slate-500 hover:text-slate-300 transition-colors mt-0.5 shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="px-7 py-6 space-y-5">
                  {/* Google button */}
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-semibold text-sm transition-colors shadow-sm"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {tr.google}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{tr.orDivider}</span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>

                  {/* Sign in / Register tabs */}
                  <div className="flex bg-slate-800/60 rounded-xl p-1 gap-1">
                    <button
                      onClick={() => switchMode('login')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                        mode === 'login'
                          ? 'bg-slate-700 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {tr.tabSignIn}
                    </button>
                    <button
                      onClick={() => switchMode('register')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                        mode === 'register'
                          ? 'bg-slate-700 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {tr.tabRegister}
                    </button>
                  </div>

                  {/* Email/password form */}
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-400 block">{tr.email}</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={15} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-400 block">{tr.password}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={15} />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all"
                        />
                      </div>
                      {mode === 'login' && (
                        <div className="flex justify-end pt-0.5">
                          <button
                            type="button"
                            onClick={() => switchMode('forgot')}
                            className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
                          >
                            {tr.forgotPassword}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-start gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl"
                        >
                          <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-400 leading-relaxed">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors mt-1"
                    >
                      {loading
                        ? (mode === 'login' ? tr.loadingSignIn : tr.loadingRegister)
                        : (mode === 'login' ? tr.signIn : tr.createAccount)
                      }
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </>
  );
});
