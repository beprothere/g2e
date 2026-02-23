import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";
import img1 from "@/public/img/1.jpg";
import img2 from "@/public/img/2.jpg";
import img3 from "@/public/img/3.jpg";
import img4 from "@/public/img/4.jpg";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold">About Us</h1>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              We are a passionate team focused on building secure, reliable, and
              user-friendly digital platforms for modern businesses.
            </p>
          </div>

          <Card className="p-8 md:p-10 space-y-6">
            <h2 className="text-2xl font-semibold">Our Story</h2>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Our journey started with a simple idea: to create a platform that
              users can trust. In a world where security, transparency, and
              performance matter more than ever, we decided to build systems
              that put users first.
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              From secure authentication and two-factor verification to clean
              user experiences, our goal has always been to combine strong
              engineering with thoughtful design. Every feature we build is
              tested with real-world scenarios in mind.
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Today, we continue to grow, improve, and innovate — driven by
              feedback, passion, and a commitment to quality.
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 space-y-4">
              <h3 className="text-xl font-semibold">Our Mission</h3>
              <p className="text-sm text-foreground/80">
                To deliver secure, scalable, and easy-to-use digital solutions
                that empower users and businesses worldwide.
              </p>
            </Card>

            <Card className="p-8 space-y-4">
              <h3 className="text-xl font-semibold">Our Vision</h3>
              <p className="text-sm text-foreground/80">
                To become a trusted technology partner known for reliability,
                innovation, and exceptional user experience.
              </p>
            </Card>
          </div>

          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Meet Our Team</h2>
              <p className="text-foreground/70 mt-2">
                The people behind the product
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center space-y-4">
                <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden">
                  <Image
                    src={img1}
                    alt="Javaid Iqbal"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Javaid Iqbal</h4>
                  <p className="text-sm text-foreground/70">
                    Founder & Lead Engineer
                  </p>
                </div>
                <p className="text-sm text-foreground/80">
                  Responsible for system architecture, security, and core
                  platform development.
                </p>
              </Card>

              <Card className="p-6 text-center space-y-4">
                <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden">
                  <Image
                    src={img2}
                    alt="Eman Fatima"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Eman Fatima</h4>
                  <p className="text-sm text-foreground/70">Product Manager</p>
                </div>
                <p className="text-sm text-foreground/80">
                  Oversees product strategy, feature planning, and user
                  experience alignment.
                </p>
              </Card>

              <Card className="p-6 text-center space-y-4">
                <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden">
                  <Image
                    src={img3}
                    alt="Mukhtiar Tariq"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Mukhtiar Tariq</h4>
                  <p className="text-sm text-foreground/70">
                    Backend Developer
                  </p>
                </div>
                <p className="text-sm text-foreground/80">
                  Focuses on APIs, databases, authentication systems, and
                  performance optimization.
                </p>
              </Card>

              <Card className="p-6 text-center space-y-4">
                <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden">
                  <Image
                    src={img4}
                    alt="Sobia Mukhtiar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Sobia Mukhtiar</h4>
                  <p className="text-sm text-foreground/70">UI / UX Designer</p>
                </div>
                <p className="text-sm text-foreground/80">
                  Designs clean interfaces and ensures a smooth, intuitive user
                  experience across the platform.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
