<?php

namespace App\Security;

use App\Entity\Usuarios;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class EmailVerifier
{
    public function __construct(
        private MailerInterface $mailer,
        private UrlGeneratorInterface $urlGenerator
    ) {}

    public function sendVerificationEmail(Usuarios $user): void
    {
        $token = bin2hex(random_bytes(32));
        $expiresAt = new \DateTimeImmutable('+24 hours');
        
        $user->setVerificationToken($token);
        $user->setVerificationTokenExpiresAt($expiresAt);
        
        $verificationUrl = $this->urlGenerator->generate('app_verify_email', [
            'token' => $token
        ], UrlGeneratorInterface::ABSOLUTE_URL);

        $email = (new Email())
            ->from('noreply@tudominio.com')
            ->to($user->getCorreo())
            ->subject('Confirma tu correo electrónico')
            ->html($this->getVerificationEmailTemplate($verificationUrl));

        $this->mailer->send($email);
    }

    private function getVerificationEmailTemplate(string $url): string
    {
        return <<<HTML
        <h1>Confirma tu cuenta</h1>
        <p>Haz clic en el siguiente enlace para verificar tu email:</p>
        <a href="{$url}">Confirmar correo</a>
        <p>Este enlace expirará en 24 horas.</p>
        HTML;
    }
}