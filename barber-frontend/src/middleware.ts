import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("@BarberSaaS:token")?.value;

  // Lista de rotas que qualquer pessoa pode acessar sem estar logada
  const publicRoutes = ["/login", "/setup-password"];

  // Verifica se a rota atual está na lista de rotas públicas
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  // 1. Se NÃO tem token e NÃO está em uma rota pública
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Se TEM token e tenta acessar o login (ou a criação de senha novamente)
  if (token && isPublicRoute) {
    // Redireciona para a agenda (e não para o dashboard)
    return NextResponse.redirect(new URL("/agenda", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // CORREÇÃO: Expressão regular atualizada para ignorar extensões de imagens (.png, .jpg, etc)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
