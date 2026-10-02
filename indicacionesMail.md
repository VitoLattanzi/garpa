# Documentación de Sistema de Correos - Garpa

## 1. Estrategia Anti-Spam
Para mejorar la entregabilidad de los correos y evitar que terminen en SPAM, se requiere la implementación de las siguientes medidas:

- **Servicio Transaccional:** Migrar de `Nodemailer` directo con Gmail SMTP a un servicio especializado como **Resend**, **SendGrid** o **Postmark**.
- **Configuración de Dominio (Obligatorio):**
  - **SPF (Sender Policy Framework):** Configurar el registro TXT en el DNS del dominio para autorizar al servicio de correos a enviar en nuestro nombre.
  - **DKIM (DomainKeys Identified Mail):** Implementar la firma criptográfica para validar la autenticidad del correo.
  - **DMARC:** Configurar la política de reporte y acción para correos que no pasen SPF/DKIM.
- **Reputación:** Evitar el uso de cuentas de Gmail personales para envíos transaccionales masivos o automatizados, ya que tienen límites estrictos y baja reputación para esto.

## 2. Mapeo de Plantillas

| Escenario | Tipo de Correo | Objetivo |
| :--- | :--- | :--- |
| **Registro de usuario** | Verificación de cuenta | Enviar link al `/login` o confirmación de registro. |
| **Invitar amigo (sin cuenta)** | Invitación a Garpa | Enviar invitación a unirse con link al `/register`. |
| **Solicitud de amistad** | Nueva solicitud | Notificar solicitud con link a la app (`/amigos`). |
| **Reenviar solicitud** | Nueva solicitud (Reenvío) | Idéntico al anterior, notificando la solicitud pendiente. |
