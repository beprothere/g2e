export function BaseEmail(title: string, content: string) {
  return `
  <div style="background:#ffffff00;padding:40px 0;font-family:Arial">
    <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden">
      
      <div style="background:linear-gradient(135deg,#00ffa3,#00c2ff);padding:20px;text-align:center">
        <img
          src="https://zeenetwork.vercel.app/img/logo2.png"
          height="40"
          alt="Glow2Earn"
        />
        <h2 style="margin-top:10px">${title}</h2>
      </div>

      <div style="padding:24px;color:#111;line-height:1.6">
        ${content}
      </div>

      <div style="background:#f3f4f6;padding:14px;text-align:center;font-size:12px;color:#555">
        © ${new Date().getFullYear()} Glow2Earn · support@glow2earn.com
      </div>
    </div>
  </div>
  `;
}
