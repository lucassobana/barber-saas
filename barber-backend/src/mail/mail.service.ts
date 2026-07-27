import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    // Inicializa o SDK com a chave do .env
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendInviteEmail(email: string, token: string) {
    // Monta o link que o cliente vai clicar e abrir no Next.js
    const inviteLink = `${process.env.FRONTEND_URL}/setup-password?token=${token}`;

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'onboarding@resend.dev', // Em testes, use esse e-mail padrão do Resend
        to: email,
        subject: 'Convite Especial - Finalize seu cadastro',
        // Para o MVP, começamos com um HTML simples. Depois podemos usar o React Email.
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Bem-vindo à nossa plataforma!</h2>
            <p>Seu perfil foi criado. Para acessar o painel, por favor, defina sua senha segura clicando no botão abaixo:</p>
            <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #3182ce; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 15px;">
              Criar minha senha
            </a>
            <p style="margin-top: 30px; font-size: 12px; color: #777;">
              Se o botão não funcionar, copie e cole este link no navegador:<br/>
              ${inviteLink}
            </p>
          </div>
        `,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      console.error('Erro ao enviar e-mail:', err);
      throw new InternalServerErrorException(
        'Falha no envio do e-mail de convite',
      );
    }
  }
}
