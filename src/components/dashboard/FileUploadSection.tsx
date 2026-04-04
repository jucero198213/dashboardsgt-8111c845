import { useRef } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFinancialData } from "@/contexts/FinancialDataContext";

function UploadSlot({
  label,
  status,
  fileName,
  onFileSelect,
  onClear,
}: {
  label: string;
  status: "idle" | "loaded" | "error";
  fileName: string;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && /\.(xlsx|xls)$/i.test(file.name)) onFileSelect(file);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => status === "idle" && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-all duration-200 cursor-pointer min-h-[180px] ${
        status === "loaded"
          ? "border-primary/40 bg-primary/5"
          : status === "error"
          ? "border-destructive/40 bg-destructive/5"
          : "border-border/60 bg-secondary/20 hover:border-border hover:bg-secondary/40"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = "";
        }}
      />

      {status === "idle" && (
        <>
          <div className="rounded-full bg-secondary/60 p-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Arraste ou clique para selecionar · .xlsx, .xls
            </p>
          </div>
          <span className="rounded-md bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
            Aguardando arquivo
          </span>
        </>
      )}

      {status === "loaded" && (
        <>
          <CheckCircle2 className="h-8 w-8 text-primary" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-primary">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              {fileName}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <span className="rounded-md bg-primary/10 px-3 py-1 text-xs text-primary font-medium">
            Carregado com sucesso
          </span>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="mt-1 text-xs text-destructive">Erro ao carregar arquivo</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
              inputRef.current?.click();
            }}
            className="rounded-md bg-destructive/10 px-3 py-1 text-xs text-destructive font-medium hover:bg-destructive/20 transition-colors"
          >
            Tentar novamente
          </button>
        </>
      )}
    </div>
  );
}

export function FileUploadSection() {
  const {
    uploadReceber,
    uploadPagar,
    setFileReceber,
    setFilePagar,
    clearFileReceber,
    clearFilePagar,
    processData,
    isProcessing,
    isProcessed,
  } = useFinancialData();

  const bothLoaded = uploadReceber.status === "loaded" && uploadPagar.status === "loaded";

  return (
    <section className="mb-10">
      <div className="rounded-xl border border-border/50 bg-card p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold tracking-tight">Importação de Dados</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Importe as planilhas de Contas a Receber e Contas a Pagar para gerar a consolidação financeira
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <UploadSlot
            label="Contas a Receber"
            status={uploadReceber.status}
            fileName={uploadReceber.fileName}
            onFileSelect={setFileReceber}
            onClear={clearFileReceber}
          />
          <UploadSlot
            label="Contas a Pagar"
            status={uploadPagar.status}
            fileName={uploadPagar.fileName}
            onFileSelect={setFilePagar}
            onClear={clearFilePagar}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {isProcessed ? (
              <span className="text-primary flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Dados processados com sucesso
              </span>
            ) : bothLoaded ? (
              "Pronto para processar"
            ) : (
              "Carregue os dois arquivos para continuar"
            )}
          </div>
          <Button
            onClick={processData}
            disabled={!bothLoaded || isProcessing}
            className="min-w-[180px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Processar Dados"
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
