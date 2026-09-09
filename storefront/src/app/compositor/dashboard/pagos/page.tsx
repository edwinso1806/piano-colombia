"use client";

import Link from "next/link";
import { useState } from "react";

export default function CompositorPagosPage() {
  const [bankName, setBankName] = useState("Bancolombia");
  const [accountType, setAccountType] = useState("Ahorros");
  const [accountNumber, setAccountNumber] = useState("582-910284-12");
  const [taxId, setTaxId] = useState("CC 19.482.910");
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  const payouts = [
    {
      id: "WOMPI-PO-98402",
      date: "15 Ago 2026",
      method: "Wompi Transfer (Bancolombia Ahorros ***28412)",
      salesCount: 14,
      grossAmount: "$630.000 COP",
      commissionPC: "$126.000 COP",
      netAmount: "$504.000 COP",
      status: "Completado",
      txnHash: "WMP-TX-5X9820194",
    },
    {
      id: "WOMPI-PO-87211",
      date: "15 Jul 2026",
      method: "Wompi Transfer (Bancolombia Ahorros ***28412)",
      salesCount: 16,
      grossAmount: "$720.000 COP",
      commissionPC: "$144.000 COP",
      netAmount: "$576.000 COP",
      status: "Completado",
      txnHash: "WMP-TX-4P7710294",
    },
    {
      id: "WOMPI-PO-76100",
      date: "15 Jun 2026",
      method: "Wompi Transfer (Bancolombia Ahorros ***28412)",
      salesCount: 10,
      grossAmount: "$450.000 COP",
      commissionPC: "$90.000 COP",
      netAmount: "$360.000 COP",
      status: "Completado",
      txnHash: "WMP-TX-3M2201948",
    },
  ];

  return (
    <div className="space-y-8 font-inter">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
            <span className="material-symbols-outlined text-xs">account_balance_wallet</span>
            Liquidaciones & Dispersión Wompi API
          </div>
          <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
            Historial de Regalías & Cuenta Wompi
          </h1>
          <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed">
            Consulte las dispersiones automáticas quincenales por concepto de ventas de partituras (80% neto para el autor / 20% comisión de la plataforma) transferidas directamente a tu banco o cuenta Wompi.
          </p>
        </div>

        {/* Card Estado de Cuenta Configurada */}
        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-xs flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center font-bold text-lg">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#4C4546] block font-montserrat">
                Cuenta Registrada para Dispersión Wompi
              </span>
              <span className="text-xs font-bold text-[#111C2D] font-montserrat">
                {bankName} ({accountType})
              </span>
              <span className="text-[11px] font-mono text-[#0071BC] block">{accountNumber}</span>
            </div>
          </div>

          <button
            onClick={() => setIsEditingAccount(!isEditingAccount)}
            className="px-3 py-1.5 text-[11px] font-bold text-[#0071BC] bg-[#F0F3FF] hover:bg-slate-200/60 rounded-xl transition font-montserrat border border-black/5"
          >
            {isEditingAccount ? "Cancelar" : "Editar"}
          </button>
        </div>
      </div>

      {/* Formulario desplegable para cambiar cuenta */}
      {isEditingAccount && (
        <div className="bg-white p-6 rounded-2xl border border-[#0071BC]/20 shadow-xs space-y-4">
          <h3 className="text-sm font-bold font-montserrat text-[#111C2D]">Actualizar Cuenta Bancaria Wompi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">Entidad Bancaria / Plataforma *</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2 text-xs font-semibold text-[#111C2D] outline-none"
              >
                <option value="Bancolombia">Bancolombia</option>
                <option value="Davivienda">Davivienda</option>
                <option value="Nequi">Nequi</option>
                <option value="Daviplata">Daviplata</option>
                <option value="Banco de Bogotá">Banco de Bogotá</option>
                <option value="BBVA">BBVA Colombia</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">Tipo de Cuenta *</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2 text-xs font-semibold text-[#111C2D] outline-none"
              >
                <option value="Ahorros">Cuenta de Ahorros</option>
                <option value="Corriente">Cuenta Corriente</option>
                <option value="Bolsillo Nequi">Bolsillo Nequi</option>
                <option value="Bolsillo Daviplata">Bolsillo Daviplata</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">Número de Cuenta / Celular *</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2 text-xs text-[#111C2D] font-mono outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-black/5">
            <p className="text-[11px] text-[#4C4546]">
              Las dispersiones se transfieren automáticamente los días 15 y 30 de cada mes mediante la API de Wompi.
            </p>
            <button
              onClick={() => {
                setIsEditingAccount(false);
                alert("Cuenta de dispersión Wompi actualizada correctamente.");
              }}
              className="px-5 py-2.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat shrink-0"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      )}

      {/* Grid KPI Cards Resumen Financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#0071BC]"></div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
            Total Dispersado Histórico
          </span>
          <div className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D]">
            $1.440.000 <span className="text-xs font-bold text-[#4C4546]">COP</span>
          </div>
          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 font-montserrat">
            <span className="material-symbols-outlined text-sm">verified</span> 3 Lotes Transferidos Wompi API
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FBB03B]"></div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
            Saldo Acumulado Pendiente
          </span>
          <div className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D]">
            $540.000 <span className="text-xs font-bold text-[#4C4546]">COP</span>
          </div>
          <span className="text-xs text-[#0071BC] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span> Próximo corte: 15 de Sept. 2026
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#C1272D]"></div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
            Regla de Distribución
          </span>
          <div className="text-2xl font-black font-montserrat text-[#111C2D]">
            80% <span className="text-xs font-bold text-[#4C4546]">Autor</span> / 20% <span className="text-xs font-bold text-[#4C4546]">PC</span>
          </div>
          <span className="text-xs text-[#4C4546] font-medium">
            Pagos quincenales automáticos los días 15 y 30
          </span>
        </div>
      </div>

      {/* Tabla Lotes de Dispersión */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-montserrat text-[#111C2D]">Lotes de Liquidación Wompi</h2>
            <p className="text-xs text-[#4C4546]">Histórico de transferencias masivas procesadas vía Wompi API.</p>
          </div>
          <button
            onClick={() => alert("Descargando informe consolidado en formato CSV...")}
            className="px-3.5 py-2 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat flex items-center gap-1.5 border border-black/5"
          >
            <span className="material-symbols-outlined text-base text-[#0071BC]">download</span>
            Exportar CSV
          </button>
        </div>

        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F3FF] text-[#4C4546] font-montserrat text-[11px] font-extrabold uppercase tracking-wider border-b border-black/5">
                <th className="py-3.5 px-6">ID Lote Wompi</th>
                <th className="py-3.5 px-6">Fecha de Corte</th>
                <th className="py-3.5 px-6">Ventas</th>
                <th className="py-3.5 px-6">Total Bruto</th>
                <th className="py-3.5 px-6">Comisión PC (20%)</th>
                <th className="py-3.5 px-6">Neto Depositado (80%)</th>
                <th className="py-3.5 px-6">Estado Wompi</th>
                <th className="py-3.5 px-6 text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs text-[#111C2D]">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-[#F0F3FF]/40 transition">
                  <td className="py-4 px-6 font-mono font-bold text-[#0071BC]">
                    {p.id}
                    <span className="block text-[10px] font-mono text-[#4C4546]">{p.txnHash}</span>
                  </td>
                  <td className="py-4 px-6 font-medium text-[#4C4546]">
                    {p.date}
                  </td>
                  <td className="py-4 px-6 font-bold font-montserrat">
                    {p.salesCount} partituras
                  </td>
                  <td className="py-4 px-6 font-mono font-medium text-[#4C4546]">
                    {p.grossAmount}
                  </td>
                  <td className="py-4 px-6 font-mono text-[#C1272D] font-medium">
                    {p.commissionPC}
                  </td>
                  <td className="py-4 px-6 font-mono font-black text-sm text-[#111C2D]">
                    {p.netAmount}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold font-montserrat border border-emerald-200">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => alert(`Generando certificado PDF de retención y pago Wompi para ${p.id}...`)}
                      className="px-3 py-1.5 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#0071BC] rounded-xl font-extrabold text-xs transition font-montserrat inline-flex items-center gap-1 border border-black/5"
                    >
                      <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                      Recibo PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
