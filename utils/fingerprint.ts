export const getFingerprint = (req: Request) => {
  const ua = req.headers.get("user-agent") || ""
  const lang = req.headers.get("accept-language") || ""
  return Buffer.from(ua + lang).toString("base64")
}
