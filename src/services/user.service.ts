import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

// Função para criar um novo usuário
export const createUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Opcional: você pode querer fazer algo com o usuário criado aqui, como salvar no Firestore
    console.log('Usuário criado:', userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Erro ao criar usuário:', errorMessage);
    // Retorna uma mensagem de erro mais amigável
    return { success: false, error: errorMessage };
  }
};

// Função para fazer login de um usuário
export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Usuário logado:', userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Erro ao fazer login:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Função para enviar email de redefinição de senha
export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Erro ao enviar email de redefinição:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Função para fazer logout do usuário
export const signOutUser = async () => {
  try {
    await auth.signOut();
    console.log('Usuário deslogado com sucesso.');
    return { success: true };
  } catch (error) {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Erro ao fazer logout:', errorMessage);
    return { success: false, error: errorMessage };
  }
};
