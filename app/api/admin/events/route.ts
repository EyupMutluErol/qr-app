import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    try {
        const body = await request.json();
        const {name,latitude,longitude} = body;

        if(!name || latitude === undefined || longitude === undefined){
            return NextResponse.json(
                {error:"Lütfen tüm alanları doldurun."},
                {status:400}
            )
        }

        const newEvent = await prisma.event.create({
            data:{
                name,
                latitude:parseFloat(latitude),
                longitude:parseFloat(longitude)
            }
        })

        return NextResponse.json(
            {message:"Etkinlik başarıyla oluşturuldu.",event:newEvent},
            {status:201}
        )
    } catch (error) {
        console.log("Etkinlik oluşturma hatası:",error);
        return NextResponse.json(
            {error:"Etkinlik oluşturulurken teknik bir hata meydana geldi."},
            {status:500}
        )
    }
}