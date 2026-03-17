'use client';

import { useState, useEffect } from 'react';
import { createUser, signInUser, sendPasswordReset } from '@/services/user.service';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import { useDemoGuard } from '@/utils/useDemoGuard';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasNumber: false,
    hasUpperAndLower: false,
    hasSpecial: false,
    identicalPass: false,
  });
  const router = useRouter();
  const { addNotification } = useNotification();
  const guard = useDemoGuard();

  const passwordTipsUlStyle = {
    listStyle: 'none',
    padding: '10px 0 0 5px',
    margin: 0,
    fontSize: '0.8rem',
  };

  useEffect(() => {
    if (activeTab === 'signup') {
      setPasswordCriteria({
        minLength: password.length >= 6,
        hasNumber: /\d/.test(password),
        hasUpperAndLower: /[A-Z]/.test(password) && /[a-z]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        identicalPass: password !== '' && password === confirmPassword,
      });
    }
  }, [password, confirmPassword, activeTab]);


  const renderPasswordTip = (text: string, isMet: boolean) => {
    const icon = isMet ? '✓' : '✗';
    const style = { color: isMet ? 'green' : '#666' };

    return (
      <li style={style}>
        {icon} {text}
      </li>
    );
  };

  const handleTabClick = (tab: 'login' | 'signup') => {
    if (activeTab === tab) return;

    setError('');
    setIsTransitioning(true);
    setTimeout(() => {
        setActiveTab(tab);
        setIsTransitioning(false);
    }, 200); // Duração da transição em ms
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError('');
    setEmail(e.target.value);
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError('');
    setPassword(e.target.value);
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError('');
    setConfirmPassword(e.target.value);
  }

  const handleSignUp = async () => {
    const msgEmail = validateEmail(email);
    if (msgEmail) {
        setError(msgEmail);
        return;
    }
    const msgPass = validatePassword(password);
      if (msgPass) {
        setError(msgPass);
        return;
      }
    
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    await guard(async () => {
      const result = await createUser(email, password);
      if (result.success) {
        setError('');
        addNotification('Usuário criado com sucesso!', 'success');
        router.push('/');
      } else {
        if (!email) {
          setError('O email é obrigatório para criar a conta!');
        } else if (result.error === "Firebase: Error (auth/email-already-in-use).") {
          setError("Este email já está em uso!");
        } else {
          setError("Erro ao criar usuário: " + result.error);
        }
      }
    });
  };

  const handleSignIn = async () => {
    const result = await signInUser(email, password);
    if (result.success) {
      setError('');
      addNotification('Login bem-sucedido!', 'success');
      router.push('/');
    } else {
      if (!email) {
        setError('O email é obrigatório para realizar o login!');
      } else if (!password) {
        setError('A senha é obrigatória para realizar o login!');
      } else if (result.error === "Firebase: Error (auth/invalid-email)." ||
                  result.error === "Firebase: Error (auth/invalid-credential).") {
        setError("E-mail ou senha inválidos!");
      } else {
        setError("Erro ao realizar login: " + result.error);
      }
    }
  };

  const handleMissedPass = async () => {
    const msgEmail = validateEmail(email);
    if (msgEmail) {
      addNotification(msgEmail, 'error');
      return;
    }
    await guard(async () => {
      addNotification('Enviando e-mail de redefinição...', 'warning');
      const result = await sendPasswordReset(email);
      if (result.success) {
        addNotification('E-mail de redefinição enviado! Verifique sua caixa de entrada ou spam.', 'success');
      } else {
        if (result.error?.includes('auth/user-not-found')) {
          addNotification('Este e-mail não foi encontrado em nosso sistema.', 'error');
        } else {
          addNotification('Ocorreu um erro ao tentar enviar o e-mail de redefinição.', 'error');
        }
      }
    });
  }

  const validatePassword = (pass: string) => {
    if (!pass) {
        return "A senha é obrigatória para criar a conta!";
    }
    if (pass.trim().length < 6) {
      return "A senha deve ter no mínimo 6 dígitos.";
    }
    // 2. Verifica se tem pelo menos um número (0-9)
    if (!/\d/.test(pass)) {
        return "A senha deve conter pelo menos um número.";
    }
    // 3. Verifica se tem pelo menos uma letra maiúscula (A-Z) (Opcional)
    if (!/[A-Z]/.test(pass) || !/[a-z]/.test(pass)) {
        return "A senha deve conter pelo menos uma letra maiúscula e uma letra minúscula.";
    }
    // 4. Verifica se tem pelo menos um caractere especial (!@#$%^&* etc.)
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
        return "A senha deve conter pelo menos um caractere especial.";
    }
    return null;
  };

  const validateEmail = (email: string) => {
    const cleanEmail = email.trim();

    // 1. Verifica se está vazio
    if (cleanEmail.length === 0) {
      return "O email é obrigatório.";
    }
    // 2. Regex padrão para validação de email: Caracteres + @ + Caracteres + . + Caracteres
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return "Digite um email válido (ex: nome@exemplo.com).";
    }

    return null;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className={`content-wrapper ${isTransitioning ? 'fade-out' : ''}`}>
          <h2>{activeTab === 'login' ? 'Acessar Plataforma' : 'Criar Conta'}</h2>
          <p>
            {activeTab === 'login'
              ? 'Entre com seu email e senha para continuar.'
              : 'Preencha os campos abaixo para criar sua conta.'}
          </p>
        </div>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabClick('login')}
          >
            Login
          </button>
          <button
            className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => handleTabClick('signup')}
          >
            Cadastro
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="seu@email.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Sua senha"
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Esconder' : 'Mostrar'}
            </button>
          </div>
          {activeTab !== 'signup' && (
            <button onClick={handleMissedPass} className="btn-missed-pass">Esqueceu sua senha?</button>
          )}
        </div>
            
          {activeTab === 'signup' && (
            <div className="form-group">
              <label htmlFor="confirm-password">Confirme sua Senha</label>
              <div className="password-input-wrapper">
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Sua senha"
                />
              </div>
                <ul style={passwordTipsUlStyle}>
                {renderPasswordTip('Mínimo de 6 caracteres', passwordCriteria.minLength)}
                {renderPasswordTip('Pelo menos um número (0-9)', passwordCriteria.hasNumber)}
                {renderPasswordTip('Letras maiúsculas e minúsculas', passwordCriteria.hasUpperAndLower)}
                {renderPasswordTip('Pelo menos um caractere especial (!@#...)', passwordCriteria.hasSpecial)}
                {renderPasswordTip('Senha e confirmação são idênticas', passwordCriteria.identicalPass)}
              </ul>
            </div>
          )}

        <div className={`content-wrapper ${isTransitioning ? 'fade-out' : ''}`}>
          <div className="button-group">
            {activeTab === 'login' ? (
              <button onClick={handleSignIn} className="btn">
                Entrar
              </button>
            ) : (
              <button onClick={handleSignUp} className="btn">
                Criar Conta
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
