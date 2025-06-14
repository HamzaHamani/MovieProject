import ButtonSignIn from "@/components/ButtonSignIn";
import DivSignin from "@/components/divSignin";
import Toast from "@/components/toast";
import { getUser, handleSignin } from "@/lib/actions";
import { Github, Mail, Film, Play, Camera } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default async function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const user = await getUser();
  if (user) redirect("/explore");
  async function handle(provider: "github" | "google") {
    try {
      toast.loading("Redirecting to Sign in...");
      // await delay(5000);
      await handleSignin(provider);
      toast.dismiss();
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to sign in");
    } finally {
    }
  }
  return (
    <div className="grid min-h-screen w-full grid-cols-2 bg-[#111111] text-white xl:grid-cols-1">
      {/* Left Side (Form + Visuals) */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#111111] px-4 py-12 xl:px-8 lg:px-12">
        {/* Dithered Overlay Layers */}
        <div
          className="absolute inset-0 bg-white opacity-[0.02]"
          style={maskStyle("radial", 0.5, 3)}
        />
        <div
          className="absolute inset-0 bg-white opacity-[0.015]"
          style={maskStyle("radial", 0.8, 5, "25% 75%")}
        />

        {/* Pixelated Icons */}
        <PixelatedIcon
          icon={<Film className="h-16 w-16 text-white" />}
          position="top-20 left-10"
          size={3}
        />
        <PixelatedIcon
          icon={<Play className="h-12 w-12 text-white" />}
          position="top-40 right-16"
          size={2}
        />
        <PixelatedIcon
          icon={<Camera className="h-14 w-14 text-white" />}
          position="bottom-32 left-16"
          size={2.5}
        />

        {/* Decorative Gradient Circles */}
        <CircleDecoration
          position="top-1/4 left-40"
          size="w-32 h-32 xl:w-24 xl:h-24 md:w-20 md:h-20"
          opacity="bg-white/5"
          maskPx={4}
        />
        <CircleDecoration
          position="bottom-1/3 right-1/4"
          size="w-24 h-24 xl:w-20 md:w-16"
          opacity="bg-white/3"
          maskPx={3}
        />

        {/* Main Form Container */}
        <div className="relative z-10 mx-auto grid w-[400px] max-w-[90%] gap-8">
          <div className="grid gap-3 text-center">
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="text-sm text-gray-400">
              Sign in to your account to continue your cinematic journey
            </p>
          </div>

          <Card className="relative border-gray-700 bg-[#111111] shadow-2xl">
            <div
              className="absolute inset-0 rounded-lg bg-white opacity-[0.01]"
              style={maskStyle("radial", 0.3, 2)}
            />
            <CardHeader className="relative z-10 space-y-1 px-8 pb-6 pt-8">
              <CardTitle className="text-center text-2xl text-textMain">
                Sign in
              </CardTitle>
              <CardDescription className="text-center text-sm text-gray-400">
                Choose your preferred sign in method
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 grid gap-4 px-8 pb-8">
              <DivSignin />

              <Separator className="my-2 bg-gray-600" />
              <div className="text-center text-sm text-gray-400">
                Don&#39;t have an account?
                <span className="underline hover:text-white">
                  Also Continue with one of the credential providers above
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="mx-auto max-w-sm text-center text-sm text-gray-400">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-white">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side (Image + Quote) */}
      <div className="relative block w-full overflow-hidden bg-[#111111] md:hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/authBG.webp')`,
            mixBlendMode: "screen",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/60 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 z-10">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium text-white drop-shadow-2xl">
              &quot;The magic of cinema begins with a single frame, but the
              story unfolds through every moment of creativity.&quot;
            </p>
            <footer className="text-sm text-gray-200 drop-shadow-lg">
              — Film Director&#39;s Wisdom
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

function maskStyle(
  type: string,
  radius: number,
  size: number,
  origin: string = "50% 50%",
) {
  const gradient = `${type}-gradient(circle at ${origin}, transparent ${radius}px, white ${radius}px)`;
  return {
    maskImage: gradient,
    maskSize: `${size}px ${size}px`,
    WebkitMaskImage: gradient,
    WebkitMaskSize: `${size}px ${size}px`,
  };
}

function PixelatedIcon({
  icon,
  position,
  size,
}: {
  icon: React.ReactNode;
  position: string;
  size: number;
}) {
  return (
    <div className={`absolute ${position} opacity-10 xl:hidden`}>
      {icon}
      <div
        className="absolute inset-0 bg-white opacity-10"
        style={maskStyle("radial", 1, size)}
      />
    </div>
  );
}

function CircleDecoration({
  position,
  size,
  opacity,
  maskPx,
}: {
  position: string;
  size: string;
  opacity: string;
  maskPx: number;
}) {
  return (
    <div
      className={`absolute ${position} ${size} ${opacity} rounded-full`}
      style={maskStyle("radial", 1, maskPx)}
    ></div>
  );
}
