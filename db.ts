import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';

const DB_PATH = path.join(process.cwd(), 'database.json');

export interface UserLogin {
  email: string;
  loginTime: string;
  status: 'success' | 'failed';
}

interface User {
  email: string;
  passwordHash: string;
  name?: string;
  companyName?: string;
  companySize?: string;
  companyRole?: string;
  role?: 'admin' | 'user';
}

interface Database {
  users: User[];
  logins: UserLogin[];
}

async function initDB() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ users: [], logins: [] }), 'utf-8');
  }
}

async function getDB(): Promise<Database> {
  await initDB();
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(data);
    if (!db.users) db.users = [];
    if (!db.logins) db.logins = [];
    return db;
  } catch {
    return { users: [], logins: [] };
  }
}

async function saveDB(data: Database) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function registerUser(
  email: string, 
  passwordPlain: string, 
  name?: string,
  companyName?: string,
  companySize?: string,
  companyRole?: string,
  role: 'admin' | 'user' = 'user'
): Promise<boolean> {
  const db = await getDB();
  if (db.users.find(u => u.email === email)) {
    return false; // User already exists
  }
  
  const passwordHash = await bcrypt.hash(passwordPlain, 10);
  db.users.push({ 
    email, 
    passwordHash, 
    name, 
    companyName, 
    companySize, 
    companyRole, 
    role 
  });
  await saveDB(db);
  return true;
}

export async function verifyUser(email: string, passwordPlain: string): Promise<{ success: boolean, role?: string, name?: string }> {
  const db = await getDB();
  const user = db.users.find(u => u.email === email);
  
  if (!user) {
    return { success: false };
  }
  
  const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  return { success: isValid, role: isValid ? (user.role || 'user') : undefined, name: isValid ? user.name : undefined };
}

export async function addLoginLog(email: string, status: 'success' | 'failed') {
  const db = await getDB();
  db.logins.push({ email, loginTime: new Date().toISOString(), status });
  await saveDB(db);
}

export async function getLogins() {
  const db = await getDB();
  return db.logins;
}

export async function deleteUserAndLogins(email: string): Promise<boolean> {
  const db = await getDB();
  const initialUsersLength = db.users.length;
  db.users = db.users.filter(u => u.email !== email);
  db.logins = db.logins.filter(l => l.email !== email);
  await saveDB(db);
  return db.users.length < initialUsersLength;
}

