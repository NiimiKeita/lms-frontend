import api from "./api";
import type { Certificate } from "@/types/certificate";

export async function getMyCertificates(): Promise<Certificate[]> {
  const response = await api.get<Certificate[]>("/certificates/my");
  return response.data;
}

export async function getCertificate(id: number): Promise<Certificate> {
  const response = await api.get<Certificate>(`/certificates/${id}`);
  return response.data;
}

export async function downloadCertificatePdf(id: number): Promise<void> {
  const response = await api.get(`/certificates/${id}/pdf`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = `certificate-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
