import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vela — In Your Terms",
  description: "Vela is a secure messaging app, crypto wallet, and Web3 browser built with state of the art technology.",
};

export default function VelaPage() {
  return (
    <iframe
      src="/vela.html"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
        zIndex: 9999,
      }}
      title="Vela Hero"
    />
  );
}

