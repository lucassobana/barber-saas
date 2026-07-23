import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // O Middleware busca o token dentro dos cookies da requisição
  const token = request.cookies.get("@BarberSaaS:token")?.value;

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  // 1. Se o usuário NÃO tem token e tenta acessar qualquer rota (que não seja o login)
  if (!token && !isLoginPage) {
    // Redireciona para o login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Se o usuário TEM token e tenta acessar a página de login
  if (token && isLoginPage) {
    // Redireciona para o dashboard para ele não precisar logar de novo
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Se estiver tudo certo, deixa a requisição passar normalmente
  return NextResponse.next();
}

// Configuração para definir em quais rotas esse middleware vai agir
export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas, EXCETO:
     * - api (rotas de API do Next, se houver)
     * - _next/static (arquivos estáticos)
     * - _next/image (imagens otimizadas)
     * - favicon.ico (ícone do site)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
