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

interface Membership {
  barbershopId: string;
  role: "ADMIN" | "BARBER";
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
  isLoading: boolean; // 1. Novo estado para proteger a rota
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa como true
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const recoveredUser = localStorage.getItem("@BarberSaaS:user");
    const token = localStorage.getItem("@BarberSaaS:token");

    if (recoveredUser && token) {
      // Ignora o aviso, pois essa é a forma correta de hidratar dados no Next.js
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

      localStorage.setItem("@BarberSaaS:token", access_token);
      localStorage.setItem("@BarberSaaS:user", JSON.stringify(loggedUser));
      document.cookie = `@BarberSaaS:token=${access_token}; path=/; max-age=604800; samesite=lax`;

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
    localStorage.removeItem("@BarberSaaS:token");
    localStorage.removeItem("@BarberSaaS:user");
    document.cookie = "@BarberSaaS:token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
