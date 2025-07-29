<?php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../core/ResponseHelper.php';

class UserController
{
    // GET /users
    public function index()
    {
        $users = User::all();
        ResponseHelper::success($users);
    }

    // GET /users/{id}
    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            ResponseHelper::notFound("User not found");
        } else {
            ResponseHelper::success($user);
        }
    }

    // PUT /users/{id}
    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            ResponseHelper::badRequest("Invalid input");
        }

        $user = User::find($id);
        if (!$user) {
            ResponseHelper::notFound("User not found");
        }

        $updated = User::update($id, $data);
        if ($updated) {
            ResponseHelper::success(["message" => "User updated successfully"]);
        } else {
            ResponseHelper::error("Failed to update user");
        }
    }

    // DELETE /users/{id}
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            ResponseHelper::notFound("User not found");
        }

        $deleted = User::delete($id);
        if ($deleted) {
            ResponseHelper::success(["message" => "User deleted successfully"]);
        } else {
            ResponseHelper::error("Failed to delete user");
        }
    }
}
