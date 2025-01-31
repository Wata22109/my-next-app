import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("\n=== MIDDLEWARE DEBUG ===");
    console.log("Current path:", request.nextUrl.pathname);
    console.log("ADMIN_EMAIL value:", process.env.ADMIN_EMAIL);
    console.log("User email:", session?.user?.email);
    console.log(
      "Emails match?:",
      session?.user?.email?.toLowerCase() ===
        process.env.ADMIN_EMAIL?.toLowerCase()
    );
    console.log("======================\n");

    if (!session) {
      console.log("No session - redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // メールアドレスの比較を大文字小文字を区別しないように変更
    if (
      session.user.email?.toLowerCase() !==
      process.env.ADMIN_EMAIL?.toLowerCase()
    ) {
      console.log("Email mismatch - redirecting to home");
      console.log("Expected:", process.env.ADMIN_EMAIL?.toLowerCase());
      console.log("Received:", session.user.email?.toLowerCase());
      return NextResponse.redirect(new URL("/", request.url));
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
