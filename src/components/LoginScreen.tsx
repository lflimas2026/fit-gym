// src/components/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Mail, Lock, User as UserIcon, ShieldAlert, Sparkles, LogIn, UserPlus } from 'lucide-react';

export default function LoginScreen() {
  const { login, register, loginWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Carrega o SDK do Google
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      try {
        const googleObj = (window as any).google;
        if (googleObj) {
          googleObj.accounts.id.initialize({
            // Substitua pelo seu Client ID real em produção.
            // Para desenvolvimento local, o botão renderiza mas falhará se não houver um ID válido.
            // Por isso, incluímos também o botão de "Demonstração do Google" para testes rápidos.
            client_id: '109283091283-dummyclientid.apps.googleusercontent.com',
            callback: (response: any) => {
              if (response.credential) {
                setLoading(true);
                loginWithGoogle(response.credential).then(res => {
                  if (!res.success) {
                    setErrorMsg(res.error || 'Erro no login com Google');
                  }
                  setLoading(false);
                });
              }
            }
          });
          
          googleObj.accounts.id.renderButton(
            document.getElementById('google-btn-container'),
            { theme: 'dark', size: 'large', type: 'standard', shape: 'pill', text: 'signin_with', width: '280' }
          );
        }
      } catch (err) {
        console.error("Erro ao inicializar Google GIS SDK:", err);
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setErrorMsg("Preencha todos os campos obrigatórios.");
      return;
    }
    
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await register(name, email, password);
        if (!res.success) {
          setErrorMsg(res.error || "Erro ao realizar o cadastro.");
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.error || "E-mail ou senha incorretos.");
        }
      }
    } catch (err) {
      setErrorMsg("Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Login de Demonstração (Sem precisar criar conta)
  const handleQuickDemo = async () => {
    setLoading(true);
    setErrorMsg(null);
    // Tenta registrar/logar uma conta de teste padrão
    const demoEmail = 'demonstracao@fitgym.com';
    const demoPassword = 'senha_segura_123';
    
    // Primeiro tenta cadastrar, se já existir o erro é ignorado e faz o login
    await register('Convidado FitGym', demoEmail, demoPassword);
    const res = await login(demoEmail, demoPassword);
    
    if (!res.success) {
      setErrorMsg(res.error || "Erro ao iniciar demonstração.");
    }
    setLoading(false);
  };

  // Google Login de Demonstração (Simula resposta do Google para teste offline/local)
  const handleGoogleDemo = async () => {
    setLoading(true);
    setErrorMsg(null);
    
    try {
      // Simula uma requisição direta ao endpoint /api/auth/google
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleId: 'g_demo_user_12345',
          email: 'usuario.google@fitgym.com',
          name: 'Atleta Google Demo',
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Salva localmente
        localStorage.setItem('fitgym_user', JSON.stringify(data.user));
        // Recarrega a página para o Contexto de Autenticação ler do localStorage
        window.location.reload();
      } else {
        setErrorMsg(data.error || 'Erro no login simulado do Google.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Falha na conexão do login simulado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      
      {/* Luzes de Fundo (Glow Mesh) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-60 h-60 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Container Principal */}
      <div className="w-full max-w-md bg-[#0A0A0C]/80 border border-zinc-900 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl backdrop-blur-md relative z-10">
        
        {/* LOGO E TÍTULO */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Dumbbell size={24} className="rotate-45" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase text-zinc-100 flex items-center gap-1 justify-center">
              Fit-Gym <span className="text-emerald-400 font-medium lowercase text-[10px] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/10 tracking-normal">v2.0</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Seu Laboratório de Performance</p>
          </div>
        </div>

        {/* FEEDBACK DE ERRO */}
        {errorMsg && (
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3 flex gap-2.5 items-start text-xs text-rose-400 animate-in fade-in duration-200">
            <ShieldAlert size={14} className="shrink-0 mt-0.5 text-rose-500" />
            <p className="font-semibold leading-normal">{errorMsg}</p>
          </div>
        )}

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Nome Completo</label>
              <div className="relative">
                <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-[#121215] border border-zinc-800 text-zinc-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder-zinc-700"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Endereço de E-mail</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-[#121215] border border-zinc-800 text-zinc-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder-zinc-700"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Senha Secreta</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full bg-[#121215] border border-zinc-800 text-zinc-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder-zinc-700"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(16,185,129,0.2)] active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus size={14} strokeWidth={2.5} /> Criar Minha Conta
              </>
            ) : (
              <>
                <LogIn size={14} strokeWidth={2.5} /> Entrar no Laboratório
              </>
            )}
          </button>
        </form>

        {/* OU DIVIDER */}
        <div className="flex items-center justify-center gap-3 my-1">
          <div className="h-[1px] flex-1 bg-zinc-900" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Ou continue com</span>
          <div className="h-[1px] flex-1 bg-zinc-900" />
        </div>

        {/* GOOGLE SIGN IN */}
        <div className="flex flex-col items-center gap-2">
          {/* Botão Oficial do Google (Renderizado pelo SDK) */}
          <div id="google-btn-container" className="flex justify-center" />
          
          {/* Botão de Teste Rápido do Google */}
          <button 
            onClick={handleGoogleDemo}
            disabled={loading}
            className="w-full max-w-[280px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs py-2 px-4 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 mt-1 active:scale-95 disabled:opacity-50"
          >
            <Sparkles size={13} className="text-amber-400" />
            Conexão Google (Demonstração)
          </button>
        </div>

        {/* BOTÃO MUDANÇA DE ESTADO (LOGIN / SIGNUP) */}
        <div className="text-center mt-2 border-t border-zinc-950 pt-4 flex flex-col gap-3">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-[11px] font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            {isSignUp ? "Já possui cadastro? Faça Login" : "Não tem conta? Crie uma do zero"}
          </button>

          <button 
            onClick={handleQuickDemo}
            className="text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            Entrar como Convidado (Sem Registro)
          </button>
        </div>

      </div>
    </div>
  );
}
