import { NextRequest, NextResponse } from "next/server";
import {
  FrameActionPayload,
  getFrameHtml,
  validateFrameMessage,
} from "frames.js";

async function getResponse(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const body: FrameActionPayload = await req.json();
  const id = params.id;

  const { isValid, message } = await validateFrameMessage(body);

  if (!isValid) {
    console.error("Error: invalid message");
    return new NextResponse("invalid message");
  }

  console.log({ id, body });

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: "asdasd",
    })
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  console.log("asd");
  return getResponse(req, { params });
}

export const dynamic = "force-dynamic";
