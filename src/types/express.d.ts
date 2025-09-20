import "express";

// Mendeklarasikan modul global untuk menambah/mengubah tipe data yang sudah ada
declare global {
  // Menargetkan namespace dari library Express
  namespace Express {
    // Menambahkan properti baru ke dalam interface Request bawaan Express
    interface Request {
      // Menambahkan properti 'admin' yang bersifat opsional (?)
      admin?: {
        id: number;
        username: string;
      };
    }
  }
}