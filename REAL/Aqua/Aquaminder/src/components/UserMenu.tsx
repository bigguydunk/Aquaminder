import * as DropdownMenu from "./ui/dropdown-menu";
import React, { useState } from "react";
import * as Dialog from '@radix-ui/react-dialog';
import supabase from '../../supabaseClient';
import UserIcon from '../assets/icons8-user-100 1.svg?react';

interface UserMenuProps {
  userName: string | null;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps & { className?: string }> = ({ userName, onLogout, className }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [users, setUsers] = useState<Array<{ user_id: string; username: string; role: string | null }>>([]);
  const [roles, setRoles] = useState<Array<{ role_id: number; description: string }>>([]);
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const handlePegawaiClick = async () => {2
    setDialogOpen(true);
    const [{ data: usersData }, { data: rolesData }] = await Promise.all([
      supabase.from('users').select('user_id, username, role'),
      supabase.from('role').select('role_id, description'),
    ]);
    setUsers(usersData || []);
    setRoles(rolesData || []);
  };

  React.useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.id) return;
      const userId = user.id;
      const { data } = await supabase.from('users').select('role, user_id').eq('user_id', userId).single();
      if (data && data.role !== undefined) setCurrentUserRole(data.role);
      if (data && data.user_id) setCurrentUserId(data.user_id);
    };
    fetchRole();
  }, []);

  return (
    <div className={(className ? className + " " : "") + "z-10"}>
      <div className="flex items-center justify-center">
        <DropdownMenu.DropdownMenu>
          <DropdownMenu.DropdownMenuTrigger asChild>
            <button className="!bg-[#FFE3B3] !rounded-2xl shadow-md w-18 h-12 flex items-center justify-center p-0 font-semibold focus:outline-none">
              <UserIcon className="w-8 h-8 mx-auto my-auto" />
            </button>
          </DropdownMenu.DropdownMenuTrigger>
          <DropdownMenu.DropdownMenuContent align="end" className="bg-[#FFE3B3] border-none shadow-lg py-4 px-2 min-w-[180px] flex flex-col items-center rounded-lg gap-2">
            <div className="flex flex-col w-full gap-2">
              <DropdownMenu.DropdownMenuItem
                className="text-[#26648B] text-center focus:outline-none cursor-pointer font-semibold"
                onClick={() => window.location.assign('/settings')}
              >
                Settings
              </DropdownMenu.DropdownMenuItem>
              <DropdownMenu.DropdownMenuSeparator className="!bg-[#26648B] !opacity-40 h-px w-full" />
              <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                <Dialog.Trigger asChild>
                  <DropdownMenu.DropdownMenuItem
                    className="text-[#26648B] text-center focus:outline-none cursor-pointer font-semibold"
                    onClick={e => { e.preventDefault(); handlePegawaiClick(); }}
                  >
                    All Users
                  </DropdownMenu.DropdownMenuItem>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] justify-center max-w-md -translate-x-1/2 -translate-y-1/2 bg-[#FFE3B3] rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
                    <Dialog.Title className="text-lg font-bold mb-2">All Users</Dialog.Title>
                    <div className="w-full max-h-80 overflow-y-auto custom-scrollbar">
                      {users.length === 0 ? (
                        <div className="text-[#26648B] text-center">No users found.</div>
                      ) : (
                        <ul className="">
                          {users.map((user) => (
                            <li key={user.user_id} className="py-2 px-2 flex flex-col sm:flex-row sm:items-center justify-between relative group">
                              <div className="flex items-center">
                                <span className="font-medium">{user.username}</span>
                                <span className="ml-2">
                                  <RoleChanger
                                    user={user}
                                    roles={roles}
                                    currentUserRole={currentUserRole}
                                    currentUserName={userName}
                                    onRoleChange={newRole => setUsers(users => users.map(u => u.user_id === user.user_id ? { ...u, role: String(newRole) } : u))}
                                  />
                                </span>
                              </div>
                              {/* delete user */}
                              {currentUserRole === 2 && currentUserId && currentUserId !== user.user_id && (
                                <div className="ml-2 flex-shrink-0">
                                  <DeleteUserDialog userId={user.user_id} userName={user.username} onDelete={() => setUsers(users.filter(u => u.user_id !== user.user_id))} />
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Dialog.Close asChild>
                      <button className="mt-6 px-4 py-2 !bg-[#26648B] !border-1 !text-[#FFE3B3]  focus:outline-none">Close</button>
                    </Dialog.Close>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
              <DropdownMenu.DropdownMenuSeparator className="!bg-[#26648B] !opacity-40 h-px w-full" />
              <DropdownMenu.DropdownMenuItem
                onClick={onLogout}
                className="text-red-600 text-right focus:outline-none cursor-pointer font-semibold"
              >
                Log out
              </DropdownMenu.DropdownMenuItem>
            </div>
          </DropdownMenu.DropdownMenuContent>
        </DropdownMenu.DropdownMenu>
      </div>
    </div>
  );
};

const DeleteUserDialog: React.FC<{ userId: string; userName: string; onDelete: () => void }> = ({ userId, userName, onDelete }) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const handleDelete = async () => {
    setLoading(true);
    const res = await fetch('/api/deleteUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) {
      setLoading(false);
      alert('Failed to delete user from Auth: ' + (await res.text()));
      return;
    }
    const { error } = await supabase.from('users').delete().eq('user_id', userId);
    setLoading(false);
    if (error) {
      alert(`Failed to delete user: ${error.message}`);
      return;
    }
    setOpen(false);
    setConfirmText("");
    onDelete();
  };
  return (
    <>
      <button
        className="absolute right-2 top-1 !text-red-500 !hover:text-red-700 text-lg font-bold !bg-transparent border-none cursor-pointer z-20"
        title="Delete user"
        type="button"
        onClick={() => setOpen(true)}
      >
        ×
      </button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-xs -translate-x-1/2 -translate-y-1/2 bg-[#FFE3B3] rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
            <Dialog.Title className="text-lg font-bold mb-2 text-[#26648B]">Delete Account</Dialog.Title>
            <Dialog.Description className="mb-4 text-[#26648B] text-center">
              Type <span className="font-mono font-bold">{userName}</span> to confirm deletion of this account.
            </Dialog.Description>
            <input
              className="w-full px-3 py-2 rounded-lg border border-[#26648B] mb-2 text-center"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder={`Type ${userName} to confirm`}
              autoFocus
              disabled={loading}
            />
            <div className="flex gap-4 justify-center mt-2">
              <button
                className={`px-4 py-2 !bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none ${loading || confirmText !== userName ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                onClick={handleDelete}
                disabled={loading || confirmText !== userName}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <Dialog.Close asChild>
                <button className="px-4 py-2 !bg-[#FFE3B3] text-black rounded hover:bg-gray-300 focus:outline-none">Cancel</button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

const RoleChanger: React.FC<{
  user: { user_id: string; username: string; role: string | null };
  roles: { role_id: number; description: string }[];
  currentUserRole: number | null;
  currentUserName: string | null;
  onRoleChange: (newRole: number) => void;
}> = ({ user, roles, currentUserRole, currentUserName, onRoleChange }) => {
  const [editing, setEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<number | null>(user.role ? Number(user.role) : null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingRole, setPendingRole] = React.useState<number | null>(null);

  // Only allow manager (2) to change other users' roles
  const canEdit = currentUserRole === 2 && currentUserName !== user.username;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = Number(e.target.value);
    setPendingRole(newRole);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (pendingRole === null) return;
    setLoading(true);
    const { error } = await supabase.from('users').update({ role: pendingRole }).eq('user_id', user.user_id);
    setLoading(false);
    setConfirmOpen(false);
    if (!error) {
      setSelectedRole(pendingRole);
      setEditing(false);
      onRoleChange(pendingRole);
    } else {
      alert('Failed to update role: ' + error.message);
    }
  };

  if (!canEdit) {
    const foundRole = roles.find(r => r.role_id === Number(user.role));
    return <span className="text-xs text-[#26648B]  ml-2">{foundRole ? foundRole.description : 'No role'}</span>;
  }

  return (
    <>
      {editing ? (
        <select
          className="text-xs ml-2 border rounded px-1 py-0.5 !bg-[#FFE3B3]"
          value={selectedRole ?? ''}
          onChange={handleChange}
          disabled={loading}
          onBlur={() => setEditing(false)}
          autoFocus
        >
          {/* Only allow promotion to Manager, not demotion ? Mungkin diganti (idk)*/}
          {Number(user.role) === 2 ? (
            <option value="2">Manager</option>
          ) : (
            <>
              <option value="0">Pegawai</option>
              <option value="1">Supervisor</option>
              <option value="2">Manager</option>
            </>
          )}
        </select>
      ) : (
        <span
          className="text-xs text-[#26648B] ml-2 underline cursor-pointer hover:text-blue-700"
          title="Click to change role"
          onClick={() => setEditing(true)}
        >
          {(() => {
            const foundRole = roles.find(r => r.role_id === Number(user.role));
            return foundRole ? foundRole.description : 'No role';
          })()}
        </span>
      )}
      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-xs -translate-x-1/2 -translate-y-1/2 bg-[#FFE3B3] rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
            <Dialog.Title className="text-lg font-bold mb-2">Change Role</Dialog.Title>
            <Dialog.Description className="mb-4 text-gray-600 text-center">
              Are you sure you want to change the role for <span className="font-semibold">{user.username}</span> to <span className="font-semibold">{pendingRole === 0 ? 'Pegawai' : pendingRole === 1 ? 'Supervisor' : 'Manager'}</span>?
            </Dialog.Description>
            <div className="flex gap-4 justify-center mt-2">
              <button
                className="px-4 py-2 !bg-[#26648B] text-white rounded hover:bg-blue-700 focus:outline-none"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Yes'}
              </button>
              <Dialog.Close asChild>
                <button className="px-4 py-2 !bg-[#E9CD9E] text-black rounded hover:bg-[#E9CD9E] focus:outline-none">No</button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default UserMenu;
