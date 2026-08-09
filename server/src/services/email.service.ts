import { Resend } from "resend";
import { env } from "../config/env";

import { verificationEmailTemplate } from "../emails/templates/verification.email";
import { passwordResetEmailTemplate } from "../emails/templates/password-reset.email";

const resend =
    env.RESEND_API_KEY
        ? new Resend(env.RESEND_API_KEY)
        : null;

type SendEmailInput = {
    to: string;
    subject: string;
    html: string;
    text: string;
};

async function sendEmail({
    to,
    subject,
    html,
    text,
}: SendEmailInput): Promise<void> {
    if (!resend) {
        if (env.NODE_ENV === "development") {
            console.log("[EMAIL DEV MODE]");
            console.log("To:", to);
            console.log("Subject:", subject);
            console.log("Text:", text);
        }

        return;
    }

    const { error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
        text,
    });

    if (error) {
        console.error("Email delivery failed:", error);
        throw new Error("Failed to send email");
    }
}

export async function sendPasswordResetEmail(
    email: string,
    resetToken: string
): Promise<void> {
    const resetUrl =
        `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

    const template =
        passwordResetEmailTemplate({
            resetUrl,
        });

    await sendEmail({
        to: email,
        ...template,
    });
}

export async function sendVerificationEmail(
    email: string,
    verificationToken: string
): Promise<void> {
    const verificationUrl =
        `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(verificationToken)}`;

    const template =
        verificationEmailTemplate({
            verificationUrl,
        });

    await sendEmail({
        to: email,
        ...template,
    });
}