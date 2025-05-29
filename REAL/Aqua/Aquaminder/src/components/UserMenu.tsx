import * as DropdownMenu from "./ui/dropdown-menu";
import React, { useState } from "react";
import * as Dialog from '@radix-ui/react-dialog';
import supabase from '../../supabaseClient';
import UserIcon from '../assets/icons8-user-100 1.svg?react';

interface UserMenuProps {
  userName: string | null;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ userName, onLogout }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [users, setUsers] = useState<Array<{ user_id: string; username: string; role: string | null }>>([]);
  const [roles, setRoles] = useState<Array<{ role_id: number; description: string }>>([]);
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const handlePegawaiClick = async () => {
    setDialogOpen(true);
    // Fetch users and roles only when dialog opens
    const [{ data: usersData }, { data: rolesData }] = await Promise.all([
      supabase.from('users').select('user_id, username, role'),
      supabase.from('role').select('role_id, description'),
    ]);
    setUsers(usersData || []);
    setRoles(rolesData || []);
  };

  // Fetch current user's role and user_id on mount
  React.useEffect(() => {
    const fetchRole = async () => {
      // Get the current user's user_id from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.id) return;
      const userId = user.id;
      // Get the user's role and user_id by user_id
      const { data } = await supabase.from('users').select('role, user_id').eq('user_id', userId).single();
      if (data && data.role !== undefined) setCurrentUserRole(data.role);
      if (data && data.user_id) setCurrentUserId(data.user_id);
    };
    fetchRole();
  }, []);

  return (
    <div className="absolute top-6 right-8 z-10">
      <DropdownMenu.DropdownMenu>
        <DropdownMenu.DropdownMenuTrigger asChild>
          <button className="!bg-[#FFE3B3] !rounded-full shadow-md px-6 py-4 inline-block font-semibold focus:outline-none flex items-center justify-center">
            <UserIcon className="w-8 h-8" />
          </button>
        </DropdownMenu.DropdownMenuTrigger>
        <DropdownMenu.DropdownMenuContent align="end" className="bg-transparent border-transparent shadow-none py-2 min-w-[140px] flex flex-col items-end">
          <DropdownMenu.DropdownMenuItem className="!bg-white rounded-full shadow-md px-6 py-4 inline-block focus:outline-none text-center">
            User: {userName}
          </DropdownMenu.DropdownMenuItem>
          <DropdownMenu.DropdownMenuSeparator className="my-1 bg-transparent h-px" />
          <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
            <Dialog.Trigger asChild>
              <DropdownMenu.DropdownMenuItem
                className="bg-white rounded-full shadow-md px-6 py-4 inline-block focus:outline-none cursor-pointer hover:scale-110  text-center"
                onClick={e => { e.preventDefault(); handlePegawaiClick(); }}
              >
                All Users
              </DropdownMenu.DropdownMenuItem>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
              <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 z-50 flex flex-col items-end">
                <Dialog.Title className="text-lg font-bold mb-2">All Users</Dialog.Title>
                <Dialog.Description className="mb-4 text-gray-600 text-center">
                  List of all users in the system
                </Dialog.Description>
                <div className="w-full max-h-80 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="text-gray-500 text-center">No users found.</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
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
                          {/* Show delete button if current user is manager (role 2) and not deleting self (by user_id, not username) */}
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
                  <button className="mt-6 px-4 py-2 !bg-white !border-1 !border-black rounded hover:bg-gray-300 focus:outline-none">Close</button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <DropdownMenu.DropdownMenuSeparator className="my-1 bg-transparent h-px" />
          <DropdownMenu.DropdownMenuItem
            onClick={onLogout}
            className="bg-red-300 rounded-full shadow-md px-6 py-4 inline-block focus:outline-none cursor-pointer text-red-600 hover:!bg-red-300 hover:!text-red-600 hover:scale-110 transition-transform duration-150 text-center"
          >
            Log out
          </DropdownMenu.DropdownMenuItem>
        </DropdownMenu.DropdownMenuContent>
      </DropdownMenu.DropdownMenu>
    </div>
  );
};

const DeleteUserDialog: React.FC<{ userId: string; userName: string; onDelete: () => void }> = ({ userId, userName, onDelete }) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const handleDelete = async () => {
    setLoading(true);
    // Call backend API to delete from Supabase Auth
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
    // Delete from users table
    const { error } = await supabase.from('users').delete().eq('user_id', userId);
    setLoading(false);
    if (error) {
      alert(`Failed to delete user: ${error.message}`);
      return;
    }
    setOpen(false);
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
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-xs -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
            <Dialog.Title className="text-lg font-bold mb-2">Delete Account</Dialog.Title>
            <Dialog.Description className="mb-4 text-gray-600 text-center">
              Are you sure you want to delete the account for <span className="font-semibold">{userName}</span>?
            </Dialog.Description>
            <div className="flex gap-4 justify-center mt-2">
              <button
                className="px-4 py-2 !bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Yes'}
              </button>
              <Dialog.Close asChild>
                <button className="px-4 py-2 !bg-gray-200 text-black rounded hover:bg-gray-300 focus:outline-none">No</button>
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
    // Just show the role label
    const foundRole = roles.find(r => r.role_id === Number(user.role));
    return <span className="text-xs text-blue-500 ml-2">{foundRole ? foundRole.description : 'No role'}</span>;
  }

  return (
    <>
      {editing ? (
        <select
          className="text-xs ml-2 border rounded px-1 py-0.5"
          value={selectedRole ?? ''}
          onChange={handleChange}
          disabled={loading}
          onBlur={() => setEditing(false)}
          autoFocus
        >
          {/* Only allow promotion to Manager, not demotion */}
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
          className="text-xs text-blue-500 ml-2 underline cursor-pointer hover:text-blue-700"
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
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-xs -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
            <Dialog.Title className="text-lg font-bold mb-2">Change Role</Dialog.Title>
            <Dialog.Description className="mb-4 text-gray-600 text-center">
              Are you sure you want to change the role for <span className="font-semibold">{user.username}</span> to <span className="font-semibold">{pendingRole === 0 ? 'Pegawai' : pendingRole === 1 ? 'Supervisor' : 'Manager'}</span>?
            </Dialog.Description>
            <div className="flex gap-4 justify-center mt-2">
              <button
                className="px-4 py-2 !bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Yes'}
              </button>
              <Dialog.Close asChild>
                <button className="px-4 py-2 !bg-gray-200 text-black rounded hover:bg-gray-300 focus:outline-none">No</button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default UserMenu;
