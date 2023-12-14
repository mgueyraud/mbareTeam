import { Resend } from 'resend';

type CreateEmailOptions = {
    from: string,
    to: string,
    subject: string,
    html: string
}

export function sendEmail(props: CreateEmailOptions){
    const resend = new Resend(process.env.RESEND_API_KEY);

    resend.emails.send(props);
}