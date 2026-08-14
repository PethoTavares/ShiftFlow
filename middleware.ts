export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/events/:path*", "/employees/:path*", "/shifts/:path*", "/schedule/:path*", "/settings/:path*"],
};
