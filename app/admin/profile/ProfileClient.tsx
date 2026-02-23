"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { ADMIN_PAGES } from "@/lib/admin-pages";
import { Pencil, Trash2, X } from "lucide-react";
import * as actions from "./actions";

export default function ProfileClient({
  initialAdmin,
  initialRoles,
  initialUsers,
}: any) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialAdmin?.name || "");
  const [email, setEmail] = useState(initialAdmin?.email || "");
  const [avatar, setAvatar] = useState(initialAdmin?.avatar || "");
  const [password, setPassword] = useState("");
  const [roleName, setRoleName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [deleteUser, setDeleteUser] = useState<any>(null);

  const USERS_PER_PAGE = 5;
  const normalAdmins = initialUsers.filter((u: any) => !u.isSuperAdmin);
  const totalPages = Math.ceil(normalAdmins.length / USERS_PER_PAGE) || 1;
  const paginatedUsers = normalAdmins.slice(
    (page - 1) * USERS_PER_PAGE,
    page * USERS_PER_PAGE,
  );

  const runAction = (fn: any, msg: string, cb?: () => void) => {
    startTransition(async () => {
      const res = await fn();
      if (res.success) {
        toast.success(msg);
        if (cb) cb();
      } else toast.error("Operation failed");
    });
  };

  const openEdit = (u: any) => {
    setEditUser(u);
    setEditData({
      email: u.email,
      avatar: u.avatar || "",
      password: "",
      role: u.role?._id || "",
      rolePages: u.rolePages || [],
    });
  };

  return (
    <div
      className={`max-w-5xl mx-auto px-0 sm:px-0 grid gap-6 pb-20 ${isPending ? "opacity-60" : ""}`}
    >
      <Card className="px-3 md:px-6">
        <CardHeader className="px-0">
          <CardTitle>Admin Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 px-0">
          <AvatarUpload value={avatar} onChange={setAvatar} />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={!initialAdmin?.isSuperAdmin ? true : false}
          />
          {initialAdmin?.isSuperAdmin && (
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
            />
          )}
          <Button
            onClick={() =>
              runAction(
                () =>
                  actions.updateProfileAction({
                    name,
                    email,
                    avatar,
                    password,
                  }),
                "Profile updated",
                () => setPassword(""),
              )
            }
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {initialAdmin?.isSuperAdmin && (
        <>
          <Card className="px-3 md:px-6">
            <CardHeader className="px-0">
              <CardTitle>Create Role</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2 px-0">
              <Input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Role name"
              />
              <Button
                onClick={() =>
                  runAction(
                    () => actions.createRoleAction(roleName),
                    "Role created",
                    () => setRoleName(""),
                  )
                }
              >
                Create
              </Button>
            </CardContent>
          </Card>

          <Card className="px-3 md:px-6">
            <CardHeader className="px-0">
              <CardTitle>Create Admin User</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 px-0">
              <AvatarUpload value={newAvatar} onChange={setNewAvatar} />
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email"
              />
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password"
              />
              <Button
                onClick={() =>
                  runAction(
                    () =>
                      actions.createAdminAction({
                        email: newEmail,
                        password: newPassword,
                        avatar: newAvatar,
                      }),
                    "Admin created",
                    () => {
                      setNewEmail("");
                      setNewPassword("");
                      setNewAvatar("");
                    },
                  )
                }
              >
                Create
              </Button>
            </CardContent>
          </Card>

          <Card className="px-3 md:px-6">
            <CardHeader className="px-0">
              <CardTitle>Assign Role & Pages</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-0">
              <select
                className="border p-2 rounded bg-background"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select Admin User</option>
                {initialUsers.map((u: any) => (
                  <option key={u._id} value={u._id}>
                    {u.email}
                  </option>
                ))}
              </select>
              <select
                className="border p-2 rounded bg-background"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Select Role</option>
                {initialRoles.map((r: any) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ADMIN_PAGES.map((p) => (
                  <label
                    key={p.key}
                    className="flex gap-2 items-center border p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPages.includes(p.key)}
                      onChange={(e) =>
                        setSelectedPages((prev) =>
                          e.target.checked
                            ? [...prev, p.key]
                            : prev.filter((x) => x !== p.key),
                        )
                      }
                    />
                    {p.label}
                  </label>
                ))}
              </div>
              <Button
                onClick={() =>
                  runAction(
                    () =>
                      actions.assignRoleAction({
                        userId: selectedUser,
                        roleId: selectedRole,
                        pages: selectedPages,
                      }),
                    "Assigned!",
                  )
                }
              >
                Assign Role & Pages
              </Button>
            </CardContent>
          </Card>

          <Card className="px-3 md:px-6">
            <CardHeader className="px-0">
              <CardTitle>Admin Users</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-0">
              {paginatedUsers.map((u: any) => (
                <div
                  key={u._id}
                  className="border rounded p-4 flex flex-col sm:flex-row sm:justify-between gap-4"
                >
                  <div className="flex gap-3 items-center break-all">
                    <img
                      src={u.avatar || "/avatar.png"}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{u.email}</p>
                      <p className="text-sm">Role: {u.role?.name || "None"}</p>
                      <p className="text-sm">
                        Pages: {u.rolePages?.join(", ") || "None"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(u)}>
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteUser(u)}
                      className="text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center mt-4">
                <Button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} / {totalPages}
                </span>
                <Button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card border p-6 rounded w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold">Edit Admin</h2>
              <button onClick={() => setEditUser(null)}>
                <X />
              </button>
            </div>
            <AvatarUpload
              value={editData.avatar}
              onChange={(v) => setEditData({ ...editData, avatar: v })}
            />
            <div className="flex flex-col gap-4 mt-4">
              <Input
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
              />
              <PasswordInput
                value={editData.password}
                onChange={(e) =>
                  setEditData({ ...editData, password: e.target.value })
                }
                placeholder="New Password"
              />
              <select
                className="border p-2 w-full bg-background"
                value={editData.role}
                onChange={(e) =>
                  setEditData({ ...editData, role: e.target.value })
                }
              >
                <option value="">Select Role</option>
                {initialRoles.map((r: any) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                {ADMIN_PAGES.map((p) => (
                  <label key={p.key} className="flex gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editData.rolePages?.includes(p.key)}
                      onChange={(e) => {
                        const updatedPages = e.target.checked
                          ? [...editData.rolePages, p.key]
                          : editData.rolePages.filter(
                              (x: string) => x !== p.key,
                            );
                        setEditData({ ...editData, rolePages: updatedPages });
                      }}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
              <Button
                onClick={() =>
                  runAction(
                    () => actions.updateAdminUserAction(editUser._id, editData),
                    "Updated!",
                    () => setEditUser(null),
                  )
                }
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteUser && (
        <div className="fixed inset-0 px-4 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border p-6 rounded w-full max-w-sm">
            <h2 className="font-bold mb-2">Delete Admin</h2>
            <p className="text-sm mb-4">
              Are you sure you want to delete <b>{deleteUser.email}</b>?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteUser(null)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white"
                onClick={() =>
                  runAction(
                    () => actions.deleteAdminAction(deleteUser._id),
                    "Deleted!",
                    () => setDeleteUser(null),
                  )
                }
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
