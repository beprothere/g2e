import Contact from "./Contact";
import { Footer } from "@/components/layout/footer";
import { Mail, MapPin, PhoneOutgoing } from "lucide-react";
import Link from "next/link";

const GetInTouch = () => {
  return (
    <div>
      <div className="w-full h-full gap-14 flex flex-col items-center justify-start min-h-screen px-4 py-8">
        <div className="heding-description-contact-page flex w-full justify-center items-center text-center flex-col gap-2">
          <h1 className="text-2xl font-bold capitalize">
            Get in Touch With Us
          </h1>
          <b className="deep-line-brake h-1 rounded-full bg-primary w-40 flex my-1"></b>
          <p className="text-sm text-gray-400 font-normal w-2/5">
            Facing an issue with your account, rewards, withdrawals, or
            referrals? Our support team is dedicated to resolving your concerns
            quickly and efficiently. Please provide clear details so we can
            assist you better.
          </p>
        </div>

        <div className="bg-white rounded-md p-8 h-full flex gap-6 justify-between items-start w-3/4 border shadow-lg shdaow-gray-200 c-form-card">
          <div className="flex flex-col gap-14 h-full text-gray-600 w-1/2">
            <span className="w-full">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-sm">
                For any other questions, feedback, or suggestions not covered
                above, feel free to contact us. Your feedback helps us improve
                the Glow2Earn experience for everyone.
              </p>
            </span>

            <div className="flex flex-col gap-4 w-full">
              <span className="email-contact flex items-center gap-2">
                <i className="bg-gray-800 text-lg text-gray-100 p-2 flex flex-col w-fit rounded-full">
                  <Mail size={18} />{" "}
                </i>
                <Link href={"mailto:support@glow2earn.com"}>
                  support@glow2earn.com
                </Link>
              </span>
              <span className="phone-contact flex items-center gap-2">
                <i className="bg-gray-800 text-lg text-gray-100 p-2 flex flex-col w-fit rounded-full">
                  <PhoneOutgoing size={18} />{" "}
                </i>
                <Link href={"tel:111111111111"}>+1-500-000-000</Link>
              </span>
              <span className="phone-contact flex items-start gap-2 w-4/5 text-sm">
                <i className="bg-gray-800 text-lg text-gray-100 p-2 flex flex-col w-fit rounded-full">
                  <MapPin size={18} />{" "}
                </i>
                <p className="pt-1">
                  Hello Road 2, H#, Gulberg, Lahore, Pakistan
                </p>
              </span>
            </div>
          </div>
          
          <div className="bg-white w-1/2 flex flex-col rounded-md border">
            <Contact />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GetInTouch;
