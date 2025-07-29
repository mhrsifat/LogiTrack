<?php

require_once __DIR__ . "/../config/database.php";

class User
{
  private $pdo;

  private $table = "users";

  public function __construct()
  {
    $this->pdo = connectDB();
  }

  public function findByEmailOrPhone(string $email, string $phone)
  {
    $sql = "SELECT * FROM {$this->table} WHERE email = :email OR phone = :phone LIMIT 1";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute(["email" => $email, "phone" => $phone]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
  }

  public function create(
    string $name,
    string $username,
    string $email,
    string $phone,
    string $password
  ): ?array {
    $token = random_int(100000, 999999);

    $this->pdo->beginTransaction();
    $sql = "INSERT INTO {$this->table}
        (`name`, `username`, `email`, `phone`, `password`, `email_verification_token`, `email_verification_expires`)
        VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = $this->pdo->prepare($sql);
    $ok = $stmt->execute([$name, $username, $email, $phone, $password, $token, date("Y-m-d H:i:s", strtotime("+5 minutes"))]);
    $this->pdo->commit();
    if (!$ok) {
      $this->pdo->rollBack();
      return null;
    }

    return [
      "user_id" => (int) $this->pdo->lastInsertId(),
      "token" => $token,
    ];
  }

  public function findById($id)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function updateStatus($id, $status)
  {
    $stmt = $this->pdo->prepare("UPDATE users SET status = ? WHERE id = ?");
    return $stmt->execute([$status, $id]);
  }

  public function findByEmailOrUsername($username)
  {
    $stmt = $this->pdo->prepare(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(:email) or LOWER(username) = LOWER(:user)"
    );
    $stmt->execute([":email" => $username, ":user" => $username]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

   public function selectVerifyEmail($token)
  {
    $stmt = $this->pdo->prepare(
      "SELECT * FROM users WHERE email_verified = 0 AND email_verification_token = ?"
    );
    $stmt->execute([$token]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }



  public function selectVerifyEmailToken($token)
  {
    if (!$token) {
      return null;
    }
    $stmt = $this->pdo->prepare(
      "SELECT * FROM users WHERE email_verified = 0 AND email_verification_token = ? AND email_verification_expires > NOW()"
    );
    $stmt->execute([$token]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function updateUserVerify($id)
  {
    $stmt = $this->pdo->prepare(
      "UPDATE users SET email_verified = 1, email_verified_at = now(), `status` = 'active', email_verification_token = NULL WHERE id = ?"
    );
    return $stmt->execute([$id]);
  }

  public function updateEmailAndToken($userId, $email, $token, $expires)
  {
    $stmt = $this->pdo->prepare(
      "UPDATE users SET email = ?, email_verify_token = ?, email_verify_expires = ? WHERE id = ?"
    );
    return $stmt->execute([$email, $token, $expires, $userId]);
  }

  public function storeRememberToken($userId, $token, $userAgent, $ipAddress)
  {
    $stmt = $this->pdo->prepare("
        INSERT INTO remember_tokens (user_id, token, user_agent, ip_address, expires_at)
        VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
    ");
    return $stmt->execute([$userId, $token, $userAgent, $ipAddress]);
  }

  public function findByToken($token, $userAgent, $ipAddress)
  {
    if ($userAgent == "unknown" || $ipAddress == "0.0.0.0") {
      return;
    }
    $stmt = $this->pdo->prepare("
        SELECT u.* FROM users u
        JOIN remember_tokens rt ON u.id = rt.user_id
        WHERE rt.token = ? AND rt.user_agent = ? AND rt.ip_address = ? AND rt.expires_at > NOW()
        LIMIT 1
    ");
    $stmt->execute([$token, $userAgent, $ipAddress]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function logoutDevice($token, $userAgent, $ip)
  {
    $stmt = $this->pdo->prepare(
      "DELETE FROM remember_tokens WHERE token = ? AND user_agent = ? AND ip_address = ?"
    );
    return $stmt->execute([$token, $userAgent, $ip]);
  }

  public function removeAllRememberTokens($userId)
  {
    $stmt = $this->pdo->prepare(
      "DELETE FROM remember_tokens WHERE user_id = ?"
    );
    return $stmt->execute([$userId]);
  }

  //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  public static function all()
{
    $db = connectDB();
    $stmt = $db->prepare("SELECT id, name, email, phone FROM users");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

public static function find($id)
{
    $db = connectDB();
    $stmt = $db->prepare("SELECT id, name, email, phone FROM users WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

public static function update($id, $data)
{
    $db = connectDB();

    $fields = [];
    $params = [];

    if (isset($data['name'])) {
        $fields[] = 'name = ?';
        $params[] = $data['name'];
    }
    if (isset($data['email'])) {
        $fields[] = 'email = ?';
        $params[] = $data['email'];
    }
    if (isset($data['phone'])) {
        $fields[] = 'phone = ?';
        $params[] = $data['phone'];
    }

    if (empty($fields)) {
        return false;
    }

    $params[] = $id;
    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $db->prepare($sql);

    return $stmt->execute($params);
}

public static function delete($id)
{
    $db = connectDB();
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    return $stmt->execute([$id]);
}

public function emailExists($email)
{
    $stmt = $this->pdo->prepare("SELECT id FROM {$this->table} WHERE email = :email LIMIT 1");
    $stmt->execute(['email' => $email]);
    return $stmt->fetch() !== false;
}

public function usernameExists($username)
{
    $stmt = $this->pdo->prepare("SELECT id FROM {$this->table} WHERE username = :username LIMIT 1");
    $stmt->execute(['username' => $username]);
    return $stmt->fetch() !== false;
}

public function createdriver($data)
{
    $stmt = $this->pdo->prepare("
        INSERT INTO {$this->table} (
            name, 
            username, 
            email, 
            phone, 
            password, 
            role, 
            email_verification_token, 
            email_verification_expires, 
            email_verified, 
            status, 
            created_at
        ) VALUES (
            :name, 
            :username, 
            :email, 
            :phone, 
            :password, 
            :role, 
            :email_verification_token, 
            :email_verification_expires, 
            :email_verified, 
            :status, 
            :created_at
        )
    ");

    $success = $stmt->execute([
        ':name'                      => $data['name'],
        ':username'                  => $data['username'],
        ':email'                     => $data['email'],
        ':phone'                     => $data['phone'],
        ':password'                  => $data['password'],
        ':role'                      => $data['role'],
        ':email_verification_token' => $data['email_verification_token'],
        ':email_verification_expires' => $data['email_verification_expires'],
        ':email_verified'            => $data['email_verified'],
        ':status'                    => $data['status'],
        ':created_at'                => $data['created_at'],
    ]);

    if ($success) {
        return $this->pdo->lastInsertId();
    }

    return false;
}

    public function existsByUsername($username)
    {
        $stmt = $this->pdo->prepare("SELECT id FROM {$this->table} WHERE username = :username LIMIT 1");
        $stmt->execute([':username' => $username]);
        return $stmt->fetch() ? true : false;
    }

    public function existsByEmail($email)
    {
        $stmt = $this->pdo->prepare("SELECT id FROM {$this->table} WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        return $stmt->fetch() ? true : false;
    }

    public function existsByPhone($phone)
    {
        $stmt = $this->pdo->prepare("SELECT id FROM {$this->table} WHERE phone = :phone LIMIT 1");
        $stmt->execute([':phone' => $phone]);
        return $stmt->fetch() ? true : false;
    }

}
