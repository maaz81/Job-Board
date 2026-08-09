type VerificationEmailInput = {
    verificationUrl: string;
};

export function verificationEmailTemplate({
    verificationUrl,
}: VerificationEmailInput) {
    return {
        subject: "Verify your JobSphere AI email",

        text: `
Verify your JobSphere AI email.

Verify your email:
${verificationUrl}

This link will expire in 24 hours.

If you did not create this account, you can safely ignore this email.
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
    <title>Verify your email</title>
</head>

<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:40px auto;padding:32px;background:#ffffff;border-radius:12px;">
        
        <h1 style="margin-top:0;">
            Verify your email
        </h1>

        <p>
            Thanks for creating your JobSphere AI account.
        </p>

        <p>
            Please verify your email address by clicking
            the button below.
        </p>

        <p>
            <a
                href="${verificationUrl}"
                style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#4f46e5;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:8px;
                "
            >
                Verify Email
            </a>
        </p>

        <p>
            This link will expire in
            <strong>24 hours</strong>.
        </p>

        <p>
            If you did not create this account,
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