import * as DropdownMenu from "./ui/dropdown-menu";
import React, { useState } from "react";
import * as Dialog from '@radix-ui/react-dialog';
import supabase from '../../supabaseClient';

interface UserMenuProps {
  userName: string | null;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ userName, onLogout }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [users, setUsers] = useState<Array<{ user_id: number; username: string; email: string | null; role: string | null }>>([]);
  const [roles, setRoles] = useState<Array<{ role_id: number; description: string }>>([]);
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null);

  const handlePegawaiClick = async () => {
    setDialogOpen(true);
    // Fetch users and roles only when dialog opens
    const [{ data: usersData }, { data: rolesData }] = await Promise.all([
      supabase.from('users').select('user_id, username, email, role'),
      supabase.from('role').select('role_id, description'),
    ]);
    setUsers(usersData || []);
    setRoles(rolesData || []);
  };

  // Fetch current user's role on mount (if email is available)
  React.useEffect(() => {
    const fetchRole = async () => {
      if (!userName) return;
      // Try to get the user's role by username (since only username is passed)
      const { data } = await supabase.from('users').select('role').eq('username', userName).single();
      if (data && data.role !== undefined) setCurrentUserRole(data.role);
    };
    fetchRole();
  }, [userName]);

  return (
    <div className="absolute top-6 right-8 z-10">
      <DropdownMenu.DropdownMenu>
        <DropdownMenu.DropdownMenuTrigger asChild>
          <button className="!bg-white rounded-full shadow-md px-6 py-4 inline-block font-semibold focus:outline-none">
            <h2 className="text-2xl">☰</h2>
          </button>
        </DropdownMenu.DropdownMenuTrigger>
        <DropdownMenu.DropdownMenuContent align="center" className="bg-transparent border-transparent shadow-none py-2 min-w-[140px] flex flex-col items-center">
          <DropdownMenu.DropdownMenuItem className="!bg-white rounded-full shadow-md px-6 py-4 inline-block focus:outline-none  hover:bg-gray-100 text-center">
            User: {userName}
          </DropdownMenu.DropdownMenuItem>
          <DropdownMenu.DropdownMenuSeparator className="my-1 bg-transparent h-px" />
          <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
            <Dialog.Trigger asChild>
              <DropdownMenu.DropdownMenuItem
                className="!bg-white rounded-full shadow-md px-6 py-4 inline-block focus:outline-none cursor-pointer hover:bg-gray-100 text-center"
                onClick={e => { e.preventDefault(); handlePegawaiClick(); }}
              >
                Pegawai
              </DropdownMenu.DropdownMenuItem>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
              <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
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
                          <span className="font-medium">{user.username}</span>
                          <span className="text-xs text-gray-500">{user.email}</span>
                          {/* Role change logic */}
                          <RoleChanger
                            user={user}
                            roles={roles}
                            currentUserRole={currentUserRole}
                            currentUserName={userName}
                            onRoleChange={newRole => setUsers(users => users.map(u => u.user_id === user.user_id ? { ...u, role: String(newRole) } : u))}
                          />
                          {/* Show delete button if current user is manager (role 2) and not deleting self */}
                          {currentUserRole === 2 && userName !== user.username && (
                            <DeleteUserDialog userId={user.user_id} userName={user.username} onDelete={() => setUsers(users.filter(u => u.user_id !== user.user_id))} />
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
          <DropdownMenu.DropdownMenuItem onClick={onLogout} className="!bg-white rounded-full shadow-md px-6 py-4 inline-block focus:outline-none cursor-pointer text-red-600 hover:bg-gray-100 text-center">
            Log out
          </DropdownMenu.DropdownMenuItem>
        </DropdownMenu.DropdownMenuContent>
      </DropdownMenu.DropdownMenu>
    </div>
  );
};

const DeleteUserDialog: React.FC<{ userId: number; userName: string; onDelete: () => void }> = ({ userId, userName, onDelete }) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const handleDelete = async () => {
    setLoading(true);
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
        className="absolute right-2 top-1 text-red-500 hover:text-red-700 text-lg font-bold bg-transparent border-none cursor-pointer z-20"
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
  user: { user_id: number; username: string; email: string | null; role: string | null };
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
