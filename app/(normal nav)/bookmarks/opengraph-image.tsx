import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "radial-gradient(circle at 18% 18%, rgba(245, 206, 66, 0.36), rgba(6, 6, 7, 1) 55%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#facc15",
              color: "#111111",
              fontSize: "36px",
              fontWeight: 700,
            }}
          >
            C
          </div>
          <div style={{ fontSize: "42px", fontWeight: 700 }}>Cinesphere</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              fontSize: "26px",
              letterSpacing: "0.35em",
              color: "#facc15",
            }}
          >
            BOOKMARKS
          </div>
          <div
            style={{
              fontSize: "58px",
              fontWeight: 700,
              lineHeight: 1.05,
              display: "flex",
              flexDirection: "column",
            }}
          >
            Save and organize your
            <br />
            movie universe
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
