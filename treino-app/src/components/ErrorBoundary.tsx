import { Component, type ReactNode } from "react";

/** Se algo quebrar, mostra o erro na tela (em vez de uma página preta) e permite recarregar. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("Erro no app:", error);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div style={{ padding: 24, color: "#e7e9ee", fontFamily: "system-ui, sans-serif", maxWidth: 480, margin: "0 auto" }}>
        <p style={{ fontSize: 32 }}>⚠️</p>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>Ops, algo deu errado nesta tela</h1>
        <p style={{ marginTop: 8, color: "#b8bec9", fontSize: 14 }}>Tire um print desta tela e envie para o suporte. Depois toque em recarregar.</p>
        <pre style={{ marginTop: 16, padding: 12, background: "#1a1d24", borderRadius: 12, fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#ff6b4a" }}>
          {error.name}: {error.message}
          {"\n"}
          {location.hash}
          {"\n"}
          {navigator.userAgent}
          {"\n"}
          {(error.stack ?? "").split("\n").slice(0, 4).join("\n")}
        </pre>
        <button
          onClick={() => {
            location.hash = "#/";
            location.reload();
          }}
          style={{ marginTop: 16, width: "100%", padding: 14, borderRadius: 16, background: "#e8c35a", color: "#0b0c0f", fontWeight: 700, border: 0 }}
        >
          Recarregar o app
        </button>
      </div>
    );
  }
}
