import { Resend } from 'resend';

type CreateEmailOptions = {
    from: string,
    to: string,
    subject: string,
    html: string
}

export async function sendEmail(props: CreateEmailOptions){
    const resend = new Resend(process.env.RESEND_API_KEY);

    return (await resend.emails.send(props));
}