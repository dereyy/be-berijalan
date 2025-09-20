import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import type { IGlobalResponse } from "../interfaces/global.interface";

const prisma = new PrismaClient();

export const SCreateAdmin = async (data: {
  username: string;
  password: string;
  email: string;
  name: string;
}): Promise<IGlobalResponse> => {
  // Cek apakah username sudah ada
  const existingUsername = await prisma.admin.findUnique({
    where: { username: data.username },
  });

  if (existingUsername) {
    throw new Error("Username already exists");
  }

  // Cek apakah email sudah ada
  const existingEmail = await prisma.admin.findUnique({
    where: { email: data.email },
  });

  if (existingEmail) {
    throw new Error("Email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Buat admin baru
  const admin = await prisma.admin.create({
    data: {
      username: data.username,
      password: hashedPassword,
      email: data.email,
      name: data.name,
    },
  });

  return {
    status: true,
    message: "Admin created successfully",
    data: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
    },
  };
};

export const SUpdateAdmin = async (
  id: number,
  data: {
    username?: string;
    password?: string;
    email?: string;
    name?: string;
  }
): Promise<IGlobalResponse> => {
  // Cek apakah admin ada
  const existingAdmin = await prisma.admin.findUnique({
    where: { id },
  });

  if (!existingAdmin) {
    throw new Error("Admin not found");
  }

  // Cek apakah username sudah ada (jika diupdate)
  if (data.username && data.username !== existingAdmin.username) {
    const existingUsername = await prisma.admin.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new Error("Username already exists");
    }
  }

  // Cek apakah email sudah ada (jika diupdate)
  if (data.email && data.email !== existingAdmin.email) {
    const existingEmail = await prisma.admin.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new Error("Email already exists");
    }
  }

  // Hash password jika diupdate
  const updateData: any = { ...data };
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  // Update admin
  const admin = await prisma.admin.update({
    where: { id },
    data: updateData,
  });

  return {
    status: true,
    message: "Admin updated successfully",
    data: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      isActive: admin.isActive,
      updatedAt: admin.updatedAt,
    },
  };
};

export const SDeleteAdmin = async (id: number): Promise<IGlobalResponse> => {
  // Cek apakah admin ada
  const existingAdmin = await prisma.admin.findUnique({
    where: { id },
  });

  if (!existingAdmin) {
    throw new Error("Admin not found");
  }

  // Soft delete admin
  await prisma.admin.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return {
    status: true,
    message: "Admin deleted successfully",
  };
};

export const SGetAdminById = async (): Promise<IGlobalResponse> => {
  const admins = await prisma.admin.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {createdAt: 'desc',
    },
  });

  return {
    status: true,
    message: "Admins retrieved successfully",
    data: admins,
  };
} 