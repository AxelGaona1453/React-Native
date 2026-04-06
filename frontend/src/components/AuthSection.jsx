function AuthSection({ authMode, authForm, authMessage, setAuthForm, onSubmit, onToggleMode }) {
  return (
    <main className="login-view">
      <section className="login-card">
        <h1>{authMode === "login" ? "Iniciar sesion" : "Crear cuenta"}</h1>
        <p>
          {authMode === "login"
            ? "Ingresa con tu usuario para entrar a la app."
            : "Crea una cuenta si aun no tienes una."}
        </p>
        <form className="modal-form" onSubmit={onSubmit}>
          <input
            className="search-input"
            placeholder="usuario"
            value={authForm.username}
            onChange={(e) =>
              setAuthForm((prev) => ({ ...prev, username: e.target.value }))
            }
          />
          <input
            className="search-input"
            type="password"
            placeholder="password"
            value={authForm.password}
            onChange={(e) =>
              setAuthForm((prev) => ({ ...prev, password: e.target.value }))
            }
          />
          <button type="submit">
            {authMode === "login" ? "Entrar" : "Registrar"}
          </button>
          <button type="button" onClick={onToggleMode}>
            {authMode === "login"
              ? "No tengo cuenta, crear una"
              : "Ya tengo cuenta, iniciar sesion"}
          </button>
        </form>
        {authMessage && <p className="status-message error">{authMessage}</p>}
      </section>
    </main>
  );
}

export default AuthSection;
