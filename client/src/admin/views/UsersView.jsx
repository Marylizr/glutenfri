import { useCallback, useEffect, useState } from 'react';
import {
  MagnifyingGlass,
  PencilSimple,
  ShieldCheck,
  Trash,
  UserMinus,
  UserPlus,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import {
  deleteAdminUser,
  getUsers,
  setUserAdmin,
  setUserSuspension,
  updateAdminUser,
} from '../../services/admin';
import { useLanguage } from '../../i18n';
import { ADMIN_COPY, formatAdminCopy } from '../adminCopy';

export default function UsersView({ currentUser }) {
  const { language } = useLanguage();
  const copy = ADMIN_COPY[language].users;
  const common = ADMIN_COPY[language].common;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [until, setUntil] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getUsers({
      search: search || undefined,
      status: status || undefined,
      role: role || undefined,
    })
      .then(setUsers)
      .catch(() => setError(copy.loadError))
      .finally(() => setLoading(false));
  }, [copy.loadError, search, status, role]);

  useEffect(() => {
    const timer = window.setTimeout(load, 220);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openUser = (user) => {
    setSelected(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setReason('');
    setUntil('');
    setDeleteReason('');
    setDeleteConfirmation('');
    setError(null);
    setMessage('');
  };

  const updateProfile = async () => {
    setUpdating(true);
    setError(null);
    setMessage('');
    try {
      const updated = await updateAdminUser(selected._id, {
        name: editName.trim(),
        email: editEmail.trim(),
      });
      setUsers((current) => current.map((item) => (
        item._id === selected._id ? { ...item, ...updated, _id: item._id } : item
      )));
      setSelected((current) => ({ ...current, ...updated, _id: current._id }));
      setEditName(updated.name);
      setEditEmail(updated.email);
      setMessage(copy.updated);
    } catch {
      setError(copy.updateError);
    } finally {
      setUpdating(false);
    }
  };

  const deleteUser = async () => {
    setUpdating(true);
    setError(null);
    setMessage('');
    try {
      await deleteAdminUser(selected._id, {
        confirmEmail: deleteConfirmation.trim(),
        reason: deleteReason.trim(),
      });
      setUsers((current) => current.filter((item) => item._id !== selected._id));
      setSelected(null);
      setMessage(copy.deleted);
    } catch {
      setError(copy.deleteError);
    } finally {
      setUpdating(false);
    }
  };

  const updateRole = async (user) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await setUserAdmin(user._id, !user.isAdmin);
      setUsers((current) => current.map((item) => (
        item._id === user._id ? { ...item, isAdmin: updated.isAdmin } : item
      )));
      setSelected((current) => current?._id === user._id ? { ...current, isAdmin: updated.isAdmin } : current);
    } catch {
      setError(copy.roleError);
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
    } catch {
      setError(copy.suspensionError);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
      </div>

      {message && <p className="admin-success-message" role="status">{message}</p>}

      <div className={`admin-split-layout ${selected ? 'has-drawer' : ''}`}>
        <section>
          <div className="admin-filter-bar">
            <label className="admin-search-field">
              <MagnifyingGlass size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.search} />
            </label>
            <select className="admin-filter-select" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">{copy.allStatuses}</option>
              <option value="active">{copy.activePlural}</option>
              <option value="suspended">{copy.suspendedPlural}</option>
            </select>
            <select className="admin-filter-select" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="">{copy.allRoles}</option>
              <option value="admin">{copy.administrators}</option>
              <option value="user">{copy.users}</option>
            </select>
          </div>

          <div className="admin-table-wrap">
            {loading ? (
              <div className="admin-loading">{copy.loading}</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{common.user}</th>
                    <th>{copy.role}</th>
                    <th>{copy.status}</th>
                    <th>{copy.reviews}</th>
                    <th>{copy.saved}</th>
                    <th>{copy.registered}</th>
                    <th>{copy.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className={selected?._id === user._id ? 'is-selected' : ''}
                      onClick={() => openUser(user)}
                    >
                      <td>
                        <span className="admin-cell-title">{user.name}</span>
                        <span className="admin-cell-subtitle">{user.email}</span>
                      </td>
                      <td>
                        {user.isAdmin ? (
                          <span className="admin-status-pill"><ShieldCheck size={13} weight="fill" />Admin</span>
                        ) : common.user}
                      </td>
                      <td>
                        <span className={`admin-status-pill ${user.isSuspended ? 'is-danger' : ''}`}>
                          {user.isSuspended && <WarningCircle size={13} weight="fill" />}
                          {user.isSuspended ? common.suspended : common.active}
                        </span>
                      </td>
                      <td>{user.reviewsCount}</td>
                      <td>{user.savedCount}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString(language)}</td>
                      <td>
                        <button
                          className="admin-icon-button"
                          type="button"
                          aria-label={formatAdminCopy(common.editNamed, { name: user.name })}
                          onClick={(event) => {
                            event.stopPropagation();
                            openUser(user);
                          }}
                        >
                          <PencilSimple size={16} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && users.length === 0 && <div className="admin-empty">{copy.noResults}</div>}
            <div className="admin-pagination"><span>{formatAdminCopy(copy.visibleAccounts, { count: users.length })}</span></div>
          </div>
        </section>

        {selected && (
          <aside className="admin-drawer">
            <div className="admin-drawer-header">
              <div>
                <h2>{selected.name}</h2>
                <p>{selected.email}</p>
              </div>
              <button className="admin-icon-button" type="button" onClick={() => setSelected(null)} aria-label={copy.closeDetail}><X size={16} /></button>
            </div>
            <div className="admin-review-detail">
              <div className="admin-decision-box">
                <strong>{copy.accountData}</strong>
                <label className="admin-form-field">
                  {copy.name}
                  <input
                    value={editName}
                    maxLength={120}
                    onChange={(event) => setEditName(event.target.value)}
                  />
                </label>
                <label className="admin-form-field">
                  {copy.email}
                  <input
                    type="email"
                    value={editEmail}
                    maxLength={254}
                    onChange={(event) => setEditEmail(event.target.value)}
                  />
                </label>
                <button
                  className="admin-primary-button"
                  type="button"
                  disabled={
                    updating ||
                    editName.trim().length < 2 ||
                    !editEmail.includes('@') ||
                    (editName.trim() === selected.name && editEmail.trim() === selected.email)
                  }
                  onClick={updateProfile}
                >
                  {updating ? common.saving : copy.saveData}
                </button>
              </div>

              <dl className="admin-user-facts">
                <div><dt>{copy.role}</dt><dd>{selected.isAdmin ? common.administrator : common.user}</dd></div>
                <div><dt>{copy.reviews}</dt><dd>{selected.reviewsCount}</dd></div>
                <div><dt>{copy.saved}</dt><dd>{selected.savedCount}</dd></div>
                <div><dt>{copy.joined}</dt><dd>{new Date(selected.createdAt).toLocaleDateString(language)}</dd></div>
              </dl>

              <div className="admin-decision-box">
                <strong>{copy.permissions}</strong>
                <p>{copy.permissionsInfo}</p>
                <button
                  className="admin-secondary-button"
                  type="button"
                  disabled={updating || selected.id === currentUser.id || selected._id === currentUser.id}
                  onClick={() => updateRole(selected)}
                >
                  {selected.isAdmin ? <UserMinus size={16} /> : <UserPlus size={16} />}
                  {selected.isAdmin ? copy.removeAdmin : copy.makeAdmin}
                </button>
              </div>

              <div className="admin-decision-box">
                <strong>{selected.isSuspended ? copy.restoreAccount : copy.suspendAccount}</strong>
                <p>
                  {selected.isSuspended
                    ? formatAdminCopy(copy.currentReason, { reason: selected.suspensionReason || copy.notProvided })
                    : copy.accessLoss}
                </p>
                {!selected.isSuspended && (
                  <>
                    <textarea
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder={copy.suspensionReason}
                      maxLength={500}
                    />
                    <label className="admin-form-field">
                      {copy.suspendUntil}
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
                  {updating ? common.saving : selected.isSuspended ? copy.restoreAccess : copy.suspendUser}
                </button>
              </div>

              <div className="admin-decision-box admin-delete-user">
                <strong>{copy.deleteAccount}</strong>
                <p>{copy.deleteWarning}</p>
                {(selected.id === currentUser.id || selected._id === currentUser.id) ? (
                  <p>{copy.cannotDeleteSelf}</p>
                ) : (
                  <>
                    <label className="admin-form-field">
                      {copy.reason}
                      <textarea
                        value={deleteReason}
                        maxLength={500}
                        placeholder={copy.deleteReason}
                        onChange={(event) => setDeleteReason(event.target.value)}
                      />
                    </label>
                    <label className="admin-form-field">
                      {formatAdminCopy(copy.confirmEmail, { email: selected.email })}
                      <input
                        type="email"
                        value={deleteConfirmation}
                        autoComplete="off"
                        onChange={(event) => setDeleteConfirmation(event.target.value)}
                      />
                    </label>
                    <button
                      className="admin-danger-button"
                      type="button"
                      disabled={
                        updating ||
                        deleteReason.trim().length < 3 ||
                        deleteConfirmation.trim().toLowerCase() !== selected.email.toLowerCase()
                      }
                      onClick={deleteUser}
                    >
                      <Trash size={16} aria-hidden="true" />
                      {updating ? common.deleting : copy.deleteUser}
                    </button>
                  </>
                )}
              </div>
              {error && <p className="admin-error">{error}</p>}
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
