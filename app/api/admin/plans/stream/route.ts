import { planEmitter } from "@/lib/planEmitter";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: any) => {
        controller.enqueue(
          `data: ${JSON.stringify(payload)}\n\n`
        );
      };

      planEmitter.on("plan-update", send);

      return () => {
        planEmitter.off("plan-update", send);
      };
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
