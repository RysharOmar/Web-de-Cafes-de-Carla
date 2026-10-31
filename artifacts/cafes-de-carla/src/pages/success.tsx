import { Check, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Success() {
  const [items, setItems] = useState<{ name: string; qty: number; price: number }[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart_success');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
          setTotal(parsed.reduce((s: number, i: { price: number; qty: number }) => s + i.price * i.qty, 0));
        }
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f3e9] flex flex-col items-center justify-center px-6 py-16 text-center grain">
      <div className="max-w-md w-full bg-[#fbf8f0] rounded-2xl shadow-xl border border-[#ddd1be] p-10 flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#81945b]/15 text-[#81945b] flex items-center justify-center">
          <Check size={32} strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-[10px] tracking-[0.2em] text-[#8b684b] uppercase font-bold">Pago completado</span>
          <h1 className="serif text-[42px] leading-[1.05] text-[#422d1d] mt-3">¡Marchando <br /><em className="text-[#738e4d]">{items[0]?.name ? `un ${items[0].name}` : 'un americanito'}</em>!</h1>
          <p className="text-[#6d6755] text-sm leading-relaxed mt-3">Tu compra de prueba se ha confirmado. Gracias por pasarte por <strong>Cafés de Carla</strong>.</p>
        </div>

        <div className="w-full border-t border-[#ddd1be] pt-5 mt-2 space-y-2">
          {items.length === 0 && (
            <div className="flex items-center justify-between gap-4 text-sm text-[#4a3322] whitespace-nowrap">
              <span><strong>Café Americano</strong> · 1 unidad</span>
              <span className="font-serif text-lg shrink-0">1,68 €</span>
            </div>
          )}
          {items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 text-sm text-[#4a3322] whitespace-nowrap">
              <span className="truncate"><strong>{it.name}</strong> · {it.qty} unidad{it.qty > 1 ? 'es' : ''}</span>
              <span className="font-serif text-lg shrink-0">{(it.price * it.qty / 100).toFixed(2).replace('.', ',')} €</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-base font-bold text-[#422d1d] pt-2 border-t border-[#ddd1be] mt-2">
            <span>Total</span>
            <span className="font-serif">{(total / 100).toFixed(2).replace('.', ',')} €</span>
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
