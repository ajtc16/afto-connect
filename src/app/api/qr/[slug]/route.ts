import QRCode from "qrcode";
import { absoluteUrl } from "@/lib/env";

/**
 * Generate a QR code for a profile's public URL.
 * `?format=svg` (default) or `?format=png`. The QR encodes the permanent
 * `/c/[slug]` URL, so a printed card / NFC tag never needs reissuing.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const format = new URL(req.url).searchParams.get("format") ?? "svg";
  const target = absoluteUrl(`/c/${slug}`);

  const options = {
    margin: 1,
    width: 512,
    color: { dark: "#0b1220", light: "#ffffff" },
  } as const;

  if (format === "png") {
    const buffer = await QRCode.toBuffer(target, { ...options, type: "png" });
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  const svg = await QRCode.toString(target, { ...options, type: "svg" });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
