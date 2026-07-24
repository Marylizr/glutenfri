import { useCallback, useEffect, useState } from 'react';
import {
  MagnifyingGlass,
  ShieldCheck,
  UserMinus,
  UserPlus,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { getUsers, setUserAdmin, setUserSuspension } from '../../services/admin';

export default function UsersView({ currentUser }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [until, setUntil] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getUsers({
      search: search || undefined,
      status: status || undefined,
      role: role || undefined,
    })
      .then(setUsers)
      .catch(() => setError('No pudimos cargar las cuentas.'))
      .finally(() => setLoading(false));
  }, [search, status, role]);

  useEffect(() => {
    const timer = window.setTimeout(load, 220);
    return () => window.clearTimeout(timer);
  }, [load]);

  const updateRole = async (user) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await setUserAdmin(user._id, !user.isAdmin);
      setUsers((current) => current.map((item) => (
        item._id === user._id ? { ...item, isAdmin: updated.isAdmin } : item
      )));
      setSelected((current) => current?._id === user._id ? { ...current, isAdmin: updated.isAdmin } : current);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No pudimos actualizar el rol.');
    } finally {
      setUpdating(false);
    }
  };

  const updateSuspension = async () => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await setUserSuspension(selected._id, {
        suspended: !selected.isSuspended,
        reason: selected.isSuspended ? undefined : reason,
        suspendedUntil: selected.isSuspended || !until ? undefined : new Date(until).toISOString(),
      });
      setUsers((current) => current.map((item) => (
        item._id === selected._id ? { ...item, ...updated } : item
      )));
      setSelected((current) => ({ ...current, ...updated }));
      setReason('');
      setUntil('');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No pudimos actualizar la suspensión.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Usuarios</h1>
          <p>Gestiona acceso, actividad y seguridad de las cuentas.</p>
        </div>
      </div>

      <div className={`admin-split-layout ${selected ? 'has-drawer' : ''}`}>
        <section>
          <div className="admin-filter-bar">
            <label className="admin-search-field">
              <MagnifyingGlass size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o email…" />
            </label>
            <select className="admin-filter-select" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="suspended">Suspendidos</option>
            </select>
            <select className="admin-filter-select" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="user">Usuarios</option>
            </select>
          </div>

          <div className="admin-table-wrap">
            {loading ? (
              <div className="admin-loading">Cargando usuarios…</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Reseñas</th>
                    <th>Guardados</th>
                    <th>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className={selected?._id === user._id ? 'is-selected' : ''}
                      onClick={() => {
                        setSelected(user);
                        setReason('');
                        setUntil('');
                      }}
                    >
                      <td>
                        <span className="admin-cell-title">{user.name}</span>
                        <span className="admin-cell-subtitle">{user.email}</span>
                      </td>
                      <td>
                        {user.isAdmin ? (
                          <span className="admin-status-pill"><ShieldCheck size={13} weight="fill" />Admin</span>
                        ) : 'Usuario'}
                      </td>
                      <td>
                        <span className={`admin-status-pill ${user.isSuspended ? 'is-danger' : ''}`}>
                          {user.isSuspended && <WarningCircle size={13} weight="fill" />}
                          {user.isSuspended ? 'Suspendido' : 'Activo'}
                        </span>
                      </td>
                      <td>{user.reviewsCount}</td>
                      <td>{user.savedCount}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && users.length === 0 && <div className="admin-empty">No hay usuarios con esos filtros.</div>}
            <div className="admin-pagination"><span>{users.length} cuentas visibles</span></div>
          </div>
        </section>

        {selected && (
          <aside className="admin-drawer">
            <div className="admin-drawer-header">
              <div>
                <h2>{selected.name}</h2>
                <p>{selected.email}</p>
              </div>
              <button className="admin-icon-button" type="button" onClick={() => setSelected(null)} aria-label="Cerrar detalle"><X size={16} /></button>
            </div>
            <div className="admin-review-detail">
              <dl className="admin-user-facts">
                <div><dt>Rol</dt><dd>{selected.isAdmin ? 'Administrador' : 'Usuario'}</dd></div>
                <div><dt>Reseñas</dt><dd>{selected.reviewsCount}</dd></div>
                <div><dt>Guardados</dt><dd>{selected.savedCount}</dd></div>
                <div><dt>Alta</dt><dd>{new Date(selected.createdAt).toLocaleDateString('es-ES')}</dd></div>
              </dl>

              <div className="admin-decision-box">
                <strong>Permisos</strong>
                <p>El rol administrativo da acceso completo a este backoffice.</p>
                <button
                  className="admin-secondary-button"
                  type="button"
                  disabled={updating || selected.id === currentUser.id || selected._id === currentUser.id}
                  onClick={() => updateRole(selected)}
                >
                  {selected.isAdmin ? <UserMinus size={16} /> : <UserPlus size={16} />}
                  {selected.isAdmin ? 'Quitar rol de admin' : 'Hacer administrador'}
                </button>
              </div>

              <div className="admin-decision-box">
                <strong>{selected.isSuspended ? 'Restaurar cuenta' : 'Suspender cuenta'}</strong>
                <p>
                  {selected.isSuspended
                    ? `Motivo actual: ${selected.suspensionReason || 'No indicado'}`
                    : 'La persona perderá acceso inmediatamente.'}
                </p>
                {!selected.isSuspended && (
                  <>
                    <textarea
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Motivo obligatorio de la suspensión"
                      maxLength={500}
                    />
                    <label className="admin-form-field">
                      Suspender hasta (opcional)
                      <input type="datetime-local" value={until} onChange={(event) => setUntil(event.target.value)} />
                    </label>
                  </>
                )}
                <button
                  className={selected.isSuspended ? 'admin-secondary-button' : 'admin-danger-button'}
                  type="button"
                  disabled={updating || (!selected.isSuspended && reason.trim().length < 3)}
                  onClick={updateSuspension}
                >
                  {selected.isSuspended ? <UserPlus size={16} /> : <UserMinus size={16} />}
                  {updating ? 'Guardando…' : selected.isSuspended ? 'Restaurar acceso' : 'Suspender usuario'}
                </button>
              </div>
              {error && <p className="admin-error">{error}</p>}
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
