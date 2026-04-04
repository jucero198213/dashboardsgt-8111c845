import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FileUploadSection } from "@/components/dashboard/FileUploadSection";
import { FinancialCard } from "@/components/dashboard/FinancialCard";
import { IndicatorCard } from "@/components/dashboard/IndicatorCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { useFinancialData } from "@/contexts/FinancialDataContext";

const Index = () => {
  const { resumo, indicadores, isProcessed } = useFinancialData();
  const { contasReceber, contasPagar } = resumo;

  return (
    <div className="min-h-screen bg-background px-4 py-8 lg:px-8 xl:px-16">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader />
        <FileUploadSection />

        <div className={`transition-all duration-500 ${isProcessed ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none translate-y-2"}`}>
          {/* Contas a Receber */}
          <section className="mb-10">
            <SectionHeader title="Contas a Receber" icon={TrendingUp} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FinancialCard title="Valor a Receber" value={contasReceber.valorAReceber} variant="receita" />
              <FinancialCard title="Valor Recebido" value={contasReceber.valorRecebido} variant="receita" />
              <FinancialCard title="Saldo a Receber" value={contasReceber.saldoAReceber} variant="saldo-receita" linkTo="/contas-a-receber" />
            </div>
          </section>

          {/* Contas a Pagar */}
          <section className="mb-10">
            <SectionHeader title="Contas a Pagar" icon={TrendingDown} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FinancialCard title="Valor a Pagar" value={contasPagar.valorAPagar} variant="despesa" />
              <FinancialCard title="Valor Pago" value={contasPagar.valorPago} variant="despesa" />
              <FinancialCard title="Saldo a Pagar" value={contasPagar.saldoAPagar} variant="saldo-despesa" linkTo="/contas-a-pagar" />
            </div>
          </section>

          {/* Indicadores */}
          <section>
            <SectionHeader title="Indicadores Estratégicos" icon={BarChart3} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {indicadores.map((ind) => (
                <IndicatorCard
                  key={ind.id}
                  nome={ind.nome}
                  percentualReal={ind.percentualReal}
                  percentualEsperado={ind.percentualEsperado}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Index;
