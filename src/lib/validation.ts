import { z } from "zod";

export const CreateEventSchema = z.object({
  name: z.string().min(3),
  eventDate: z.coerce.date(),
  venue: z.string().optional(),
  description: z.string().optional(),
  bannerUrl: z.string().url().optional(),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export const ExcelRowSchema = z.object({
  credentialId: z.string().min(1),
  holderName: z.string().min(1),
  rollNumber: z.string().min(1),
  branch: z.string().min(1),
});

export const BulkUploadSchema = z.array(ExcelRowSchema).min(1).max(5000);

export const CreateCertificateSchema = z.object({
  credentialId: z.string().min(1).optional(),
  holderName: z.string().min(1),
  rollNumber: z.string().min(1),
  branch: z.string().min(1),
  issuedAt: z.coerce.date().optional(),
});

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const CertIdParamSchema = z.object({
  certId: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9-]+$/),
});
