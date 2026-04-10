import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { firstName, lastName, email, phone } = await req.json();

    const updatedParticipant = await prisma.participant.update({
      where: { id: id },
      data: { firstName, lastName, email, phone },
    });

    return NextResponse.json(updatedParticipant);
  } catch (error) {
    return NextResponse.json({ error: "Öğrenci güncellenirken hata oluştu" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.participant.update({
      where: { id: id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Öğrenci başarıyla sistemden kaldırıldı." });
  } catch (error) {
    return NextResponse.json({ error: "Öğrenci kaldırılırken hata oluştu" }, { status: 500 });
  }
}