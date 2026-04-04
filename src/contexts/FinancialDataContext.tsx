import React, { createContext, useContext, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import type { ContaReceber, ContaPagar, ResumoFinanceiro } from "@/data/mockData";

export interface IndicadorComparativo {
  id: string;
  nome: string;
  percentualReal: number;
  percentualEsperado: number;
}

interface UploadState {
  file: File | null;
  status: "idle" | "loaded" | "error";
  fileName: string;
}

interface FinancialDataState {
  uploadReceber: UploadState;
  uploadPagar: UploadState;
  isProcessing: boolean;
  isProcessed: boolean;
  resumo: ResumoFinanceiro;
  contasReceber: ContaReceber[];
  contasPagar: ContaPagar[];
  indicadores: IndicadorComparativo[];
}

interface FinancialDataContextType extends FinancialDataState {
  setFileReceber: (file: File) => void;
  setFilePagar: (file: File) => void;
  clearFileReceber: () => void;
  clearFilePagar: () => void;
  processData: () => Promise<void>;
}

const EXPECTED_INDICATORS: Record<string, number> = {
  "Compra de Ativo": 33,
  "Óleo Diesel": 26,
  "Folha": 21,
  "Imposto": 5,
  "Pedágio": 5,
  "Administrativo": 5,
  "Manutenção": 15,
};

const emptyUpload: UploadState = { file: null, status: "idle", fileName: "" };

const defaultResumo: ResumoFinanceiro = {
  contasReceber: { valorAReceber: 0, valorRecebido: 0, saldoAReceber: 0 },
  contasPagar: { valorAPagar: 0, valorPago: 0, saldoAPagar: 0 },
};

const FinancialDataContext = createContext<FinancialDataContextType | null>(null);

export function FinancialDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FinancialDataState>({
    uploadReceber: emptyUpload,
    uploadPagar: emptyUpload,
    isProcessing: false,
    isProcessed: false,
    resumo: defaultResumo,
    contasReceber: [],
    contasPagar: [],
    indicadores: Object.entries(EXPECTED_INDICATORS).map(([nome, esp], i) => ({
      id: String(i + 1),
      nome,
      percentualReal: 0,
      percentualEsperado: esp,
    })),
  });

  const setFileReceber = useCallback((file: File) => {
    setState((s) => ({
      ...s,
      uploadReceber: { file, status: "loaded", fileName: file.name },
      isProcessed: false,
    }));
  }, []);

  const setFilePagar = useCallback((file: File) => {
    setState((s) => ({
      ...s,
      uploadPagar: { file, status: "loaded", fileName: file.name },
      isProcessed: false,
    }));
  }, []);

  const clearFileReceber = useCallback(() => {
    setState((s) => ({ ...s, uploadReceber: emptyUpload, isProcessed: false }));
  }, []);

  const clearFilePagar = useCallback(() => {
    setState((s) => ({ ...s, uploadPagar: emptyUpload, isProcessed: false }));
  }, []);

  const parseExcel = (file: File): Promise<Record<string, string | number>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws);
          resolve(data);
        } catch {
          reject(new Error("Erro ao ler arquivo"));
        }
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
      reader.readAsArrayBuffer(file);
    });
  };

  const findColumn = (row: Record<string, string | number>, keywords: string[]): string | number | undefined => {
    for (const key of Object.keys(row)) {
      const k = key.toLowerCase();
      if (keywords.some((kw) => k.includes(kw))) return row[key];
    }
    return undefined;
  };

  const toNumber = (v: unknown): number => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const cleaned = v.replace(/[R$\s.]/g, "").replace(",", ".");
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  const processData = useCallback(async () => {
    if (!state.uploadReceber.file || !state.uploadPagar.file) return;

    setState((s) => ({ ...s, isProcessing: true }));

    try {
      // Simulate processing delay for UX
      await new Promise((r) => setTimeout(r, 1500));

      const rawReceber = await parseExcel(state.uploadReceber.file);
      const rawPagar = await parseExcel(state.uploadPagar.file);

      // Parse contas a receber
      const contasReceber: ContaReceber[] = rawReceber.map((row, i) => {
        const valor = toNumber(findColumn(row, ["valor"]));
        const statusRaw = String(findColumn(row, ["status"]) ?? "Em Aberto");
        let status: "Em Aberto" | "Vencido" | "Parcial" = "Em Aberto";
        if (statusRaw.toLowerCase().includes("venc")) status = "Vencido";
        else if (statusRaw.toLowerCase().includes("parc")) status = "Parcial";

        return {
          id: String(i + 1),
          documento: String(findColumn(row, ["doc", "documento", "nf", "nota"]) ?? `DOC-${i + 1}`),
          cliente: String(findColumn(row, ["cliente", "razao", "nome"]) ?? "N/A"),
          vencimento: String(findColumn(row, ["venc", "data"]) ?? "2024-02-01"),
          valor,
          status,
        };
      });

      // Parse contas a pagar
      const contasPagar: ContaPagar[] = rawPagar.map((row, i) => {
        const valor = toNumber(findColumn(row, ["valor"]));
        const statusRaw = String(findColumn(row, ["status"]) ?? "Em Aberto");
        let status: "Em Aberto" | "Vencido" | "Parcial" = "Em Aberto";
        if (statusRaw.toLowerCase().includes("venc")) status = "Vencido";
        else if (statusRaw.toLowerCase().includes("parc")) status = "Parcial";

        return {
          id: String(i + 1),
          documento: String(findColumn(row, ["doc", "documento", "nf", "nota"]) ?? `DOC-${i + 1}`),
          fornecedor: String(findColumn(row, ["fornecedor", "razao", "nome"]) ?? "N/A"),
          vencimento: String(findColumn(row, ["venc", "data"]) ?? "2024-02-01"),
          valor,
          status,
        };
      });

      // Calculate resumo
      const totalReceber = contasReceber.reduce((s, c) => s + c.valor, 0);
      const recebido = contasReceber.filter((c) => c.status !== "Em Aberto").reduce((s, c) => s + c.valor, 0);
      const totalPagar = contasPagar.reduce((s, c) => s + c.valor, 0);
      const pago = contasPagar.filter((c) => c.status !== "Em Aberto").reduce((s, c) => s + c.valor, 0);

      const resumo: ResumoFinanceiro = {
        contasReceber: {
          valorAReceber: totalReceber,
          valorRecebido: recebido,
          saldoAReceber: totalReceber - recebido,
        },
        contasPagar: {
          valorAPagar: totalPagar,
          valorPago: pago,
          saldoAPagar: totalPagar - pago,
        },
      };

      // Calculate indicators based on contas a pagar categories
      const indicadores: IndicadorComparativo[] = Object.entries(EXPECTED_INDICATORS).map(([nome, esp], i) => {
        const keywords = nome.toLowerCase().split(" ");
        const matchedTotal = contasPagar
          .filter((c) => {
            const desc = (c.fornecedor || "").toLowerCase();
            return keywords.some((kw) => kw.length > 3 && desc.includes(kw));
          })
          .reduce((s, c) => s + c.valor, 0);

        const percentualReal = totalPagar > 0 ? (matchedTotal / totalPagar) * 100 : 0;

        return {
          id: String(i + 1),
          nome,
          percentualReal: Math.round(percentualReal * 10) / 10,
          percentualEsperado: esp,
        };
      });

      setState((s) => ({
        ...s,
        isProcessing: false,
        isProcessed: true,
        resumo,
        contasReceber,
        contasPagar,
        indicadores,
      }));
    } catch {
      setState((s) => ({
        ...s,
        isProcessing: false,
        uploadReceber: { ...s.uploadReceber, status: "error" },
        uploadPagar: { ...s.uploadPagar, status: "error" },
      }));
    }
  }, [state.uploadReceber.file, state.uploadPagar.file]);

  return (
    <FinancialDataContext.Provider
      value={{
        ...state,
        setFileReceber,
        setFilePagar,
        clearFileReceber,
        clearFilePagar,
        processData,
      }}
    >
      {children}
    </FinancialDataContext.Provider>
  );
}

export function useFinancialData() {
  const ctx = useContext(FinancialDataContext);
  if (!ctx) throw new Error("useFinancialData must be used within FinancialDataProvider");
  return ctx;
}
