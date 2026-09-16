import { NextResponse } from "next/server";
import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:contato@webmasterdigital.com.br";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

type PushSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

type Notificacao = {
  titulo: string;
  mensagem: string;
};

export async function POST(request: Request) {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        {
          error:
            "As chaves VAPID não estão configuradas nas variáveis de ambiente.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const notificacao: Notificacao = body.notificacao;
    const subscriptions: PushSubscription[] = body.subscriptions || [];

    if (!notificacao?.titulo || !notificacao?.mensagem) {
      return NextResponse.json(
        {
          error: "Título e mensagem da notificação são obrigatórios.",
        },
        { status: 400 }
      );
    }

    if (!subscriptions.length) {
      return NextResponse.json({
        sucesso: true,
        enviadas: 0,
        removidas: 0,
      });
    }

    let enviadas = 0;
    let removidas = 0;

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify({
            title: notificacao.titulo,
            body: notificacao.mensagem,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            data: {
              url: "/",
            },
          })
        );

        enviadas++;
      } catch (error: any) {
        const statusCode = error?.statusCode;

        if (statusCode === 404 || statusCode === 410) {
          removidas++;
        }
      }
    }

    return NextResponse.json({
      sucesso: true,
      enviadas,
      removidas,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Não foi possível enviar as notificações.",
      },
      { status: 500 }
    );
  }
}