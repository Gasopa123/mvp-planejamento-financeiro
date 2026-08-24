import { NextResponse } from "next/server";
import { buscarIndicadoresBcb } from "@/lib/indicadores-bcb";

export async function GET() {
  try {
    return NextResponse.json(await buscarIndicadoresBcb());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar indicadores." },
      { status: 502 },
    );
  }
}
