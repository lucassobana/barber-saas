"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@chakra-ui/react";
import { AxiosError } from "axios";
import { setCookie, parseCookies, destroyCookie } from "nookies"; // Substituímos o localStorage por nookies

interface Membership {
  barbershopId: string;
  role: "ADMIN" | "BARBER" | "OWNER" ;
}

interface User {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  memberships: Membership[];
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface ApiErrorResponse {
  message: string | string[];
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    // Lemos os cookies usando nookies
    const { "@BarberSaaS:user": recoveredUser, "@BarberSaaS:token": token } =
      parseCookies();

    if (recoveredUser && token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(recoveredUser));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    setIsLoading(false);
  }, []);

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, user: loggedUser } = response.data;

      // Salvamos o token e o usuário nos cookies com duração de 7 dias
      setCookie(undefined, "@BarberSaaS:token", access_token, {
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: "/",
      });

      setCookie(undefined, "@BarberSaaS:user", JSON.stringify(loggedUser), {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      setUser(loggedUser);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Erro ao fazer login";

      toast({
        title: "Falha na Autenticação",
        description: errorMessage,
        status: "error",
        duration: 3000,
        position: "top-right",
      });
      throw error;
    }
  };

  const signOut = () => {
    // Removemos os cookies de forma segura
    destroyCookie(undefined, "@BarberSaaS:token");
    destroyCookie(undefined, "@BarberSaaS:user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
