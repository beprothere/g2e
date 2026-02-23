import { investmentRequestsEmitter } from "@/lib/investmentRequestsEmitter";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) =>
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);

      investmentRequestsEmitter.on("update", send);

      return () =>
        investmentRequestsEmitter.off("update", send);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
