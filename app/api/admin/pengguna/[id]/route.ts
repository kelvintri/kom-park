import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Status } from "@prisma/client";

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/admin/pengguna/[id]">) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { status } = body;

    const user = await prisma.pengguna.update({
      where: { id },
      data: { status: status as Status }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/admin/pengguna/[id]">) {
  try {
    const { id } = await ctx.params;
    // Soft delete
    const user = await prisma.pengguna.update({
      where: { id },
      data: { status: Status.NONAKTIF }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
