import { Clock, FormInputIcon, MailCheck, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccountCreatedPage() {
  return (
    <div className="flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-t-4 border-t-primary shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <ShieldCheck className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Account Created Successfully!
          </CardTitle>
          <CardDescription className="text-base font-medium text-muted-foreground pt-1">
            آپ کا اکاؤنٹ کامیابی کے ساتھ بنا دیا گیا ہے
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4 text-center">
          <div className="space-y-2 border-b pb-4 border-dashed">
            <div className="flex items-center justify-center gap-2 text-amber-600 mb-1">
              <Clock size={18} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Verification Pending
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              Please wait **7-24 hours** for account verification. You will
              receive a
              <span className="font-bold text-primary">
                {" "}
                confirmation email{" "}
              </span>
              once your account is approved. After that, you can access all
              features.
            </p>
          </div>

          <div className="space-y-2 pt-2" dir="rtl">
            <p className="text-[17px] leading-[1.8] font-medium text-foreground">
              براہ کرم اکاؤنٹ کی تصدیق کے لیے{" "}
              <span className="font-bold text-primary">7 سے 24 گھنٹے</span>{" "}
              انتظار کریں۔
            </p>
            <p className="text-[15px] leading-[1.8] text-muted-foreground italic">
              اکاؤنٹ ویریفائی ہونے کے بعد آپ کو تصدیقی ای میل موصول ہوگی، جس کے
              بعد آپ اپنے اکاؤنٹ کو استعمال کر سکیں گے۔
            </p>
          </div>

          <div className="pt-4">
            <div className="inline-flex items-center gap-2 text-xs text-white bg-secondary px-3 py-1 rounded-full">
              <MailCheck size={14} />
              Check your inbox OR spam folder
            </div>
          </div>

          <Button>
            <Link
              href="/login"
              className="px-3 py-1 rounded-xs w-full text-white flex flex-row gap-2 text-center justify-center items-center"
            >
              <FormInputIcon size={20} /> Login Now
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
