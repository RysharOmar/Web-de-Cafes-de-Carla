import { Check, ArrowUpRight } from 'lucide-react';

export default function Success() {
  return (
    <div className="min-h-screen bg-[#f7f3e9] flex flex-col items-center justify-center px-6 py-16 text-center grain">
      <div className="max-w-md w-full bg-[#fbf8f0] rounded-2xl shadow-xl border border-[#ddd1be] p-10 flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#81945b]/15 text-[#81945b] flex items-center justify-center">
          <Check size={32} strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-[10px] tracking-[0.2em] text-[#8b684b] uppercase font-bold">Pago completado</span>
          <h1 className="serif text-[42px] leading-[1.05] text-[#422d1d] mt-3">¡Marchando <br /><em className="text-[#738e4d]">un americanito!</em></h1>
          <p className="text-[#6d6755] text-sm leading-relaxed mt-3">Tu compra de prueba se ha confirmado. Gracias por pasarte por <strong>Café de la Esquina</strong>.</p>
        </div>

        <div className="w-full border-t border-[#ddd1be] pt-5 mt-2">
          <div className="flex items-center justify-between text-sm text-[#4a3322]">
            <span><strong>Café Americano</strong> · 1 unidad</span>
            <span className="font-serif text-lg">1,68 €</span>
          </div>
        </div>

        <a href="/" className="focus-ring w-full py-3.5 rounded-full bg-[#81945b] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#637746] transition-colors shadow-md shadow-[#81945b]/20">
          Volver a la cafetería <ArrowUpRight size={16} />
        </a>

        <p className="text-[10px] text-[#948675]">Este recibo corresponde a una compra en modo de prueba.</p>
      </div>
    </div>
  );
}
