import { NextResponse } from "next/server";

const COOKIE_NAME = "dbm_admin";

export function GET(req: Request) {
  const url = new URL(req.url);
  url.pathname = "/";
  url.search = "";

  const res = NextResponse.redirect(url);
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    path: "/admin",
    maxAge: 0,
  });
  return res;
}
