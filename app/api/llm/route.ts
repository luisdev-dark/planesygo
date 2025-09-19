import { NextRequest, NextResponse } from 'next/server';
import { chatWithAssistant } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'El mensaje es requerido' },
        { status: 400 }
      );
    }

    const response = await chatWithAssistant(message, context);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error en la API de LLM:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud con la IA' },
      { status: 500 }
    );
  }
}