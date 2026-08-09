type PasswordResetEmailInput = {
    resetUrl: string;
};

export function passwordResetEmailTemplate({
    resetUrl,
}: PasswordResetEmailInput) {
    return {
        subject: "Reset your JobSphere AI password",

        text: `
We received a request to reset your JobSphere AI password.

Reset your password:
${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.
        `.trim(),

        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    />
    <title>Reset your password</title>
</head>

<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:40px auto;padding:32px;background:#ffffff;border-radius:12px;">

        <h1 style="margin-top:0;">
            Reset your password
        </h1>

        <p>
            We received a request to reset your
            JobSphere AI password.
        </p>

        <p>
            Click the button below to create a new password.
        </p>

        <p>
            <a
                href="${resetUrl}"
                style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#4f46e5;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:8px;
                "
            >
                Reset Password
            </a>
        </p>

        <p>
            This link will expire in
            <strong>15 minutes</strong>.
        </p>

        <p>
            If you did not request this password reset,
            you can safely ignore this email.
        </p>

        <hr />

        <p style="color:#64748b;font-size:13px;">
            JobSphere AI — AI Powered Hiring Platform
        </p>
    </div>
</body>
</html>
        `.trim(),
    };
}