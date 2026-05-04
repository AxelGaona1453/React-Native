import { memo } from "react";

function LoginModal({
  isOpen,
  onClose,
  authForm,
  setAuthForm,
  onLogin,
  onRegister,
  authMessage,
  isLoggedIn,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{isLoggedIn ? "Sesion activa" : "Iniciar sesion"}</h2>
          <button type="button" onClick={onClose}>
            X
          </button>
        </div>

        {!isLoggedIn && (
          <form className="modal-form" onSubmit={onLogin}>
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
            <div className="modal-actions">
              <button type="submit">Iniciar sesion</button>
              <button type="button" onClick={onRegister}>
                Registrar
              </button>
            </div>
          </form>
        )}

        <p className="status-message">{authMessage}</p>
      </div>
    </div>
  );
}

export default memo(LoginModal);
