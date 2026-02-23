import { txnEmitter } from "@/lib/txnEmitter";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const send = (txn: any) => {
        controller.enqueue(`data: ${JSON.stringify(txn)}\n\n`);
      };

      txnEmitter.on("new-transaction", send);

      return () => {
        txnEmitter.off("new-transaction", send);
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
