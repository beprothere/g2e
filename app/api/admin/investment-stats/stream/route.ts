import { investmentStatsEmitter } from "@/lib/investmentStatsEmitter";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      investmentStatsEmitter.on("stats-update", send);

      return () => {
        investmentStatsEmitter.off("stats-update", send);
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
