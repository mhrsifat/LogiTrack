import React, { useEffect, useState } from "react";
import { fetchUsers, deleteUser, updateUser } from "../admin/api/userApi";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await fetchUsers();
    setUsers(data.data);
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    loadUsers();
  };

  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setFormData({ name: user.name, email: user.email, phone: user.phone });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateUser(editingUser, formData);
    setEditingUser(null);
    loadUsers();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User List</h2>
      {users.map((user) => (
        <div key={user.id} className="border p-3 rounded mb-3 shadow">
          {editingUser === user.id ? (
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border p-1 mr-2"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border p-1 mr-2"
              />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border p-1 mr-2"
              />
              <button type="submit" className="bg-blue-500 text-white px-2 py-1 mr-2">Save</button>
              <button onClick={() => setEditingUser(null)} className="bg-gray-500 text-white px-2 py-1">Cancel</button>
            </form>
          ) : (
            <>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <button onClick={() => handleEditClick(user)} className="bg-yellow-500 text-white px-2 py-1 mr-2 mt-2">Edit</button>
              <button onClick={() => handleDelete(user.id)} className="bg-red-500 text-white px-2 py-1 mt-2">Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserList;
