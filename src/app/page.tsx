'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, Terminal, AlertCircle, Building2, UserCheck, 
  Check, ChevronDown, MessageSquare, Zap, BarChart3, Globe, Cloud, 
  Lock, Smartphone, LayoutDashboard, ShoppingBag, Users, Package, 
  ShoppingCart, Landmark, Settings, ClipboardList, RefreshCw, Star,
  Menu, X, HelpCircle, Building, Bell, QrCode
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoFormSubmitted, setDemoFormSubmitted] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // States for the interactive advantage dashboard simulator
  const [demoInvoiceState, setDemoInvoiceState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [demoInvoiceCount, setDemoInvoiceCount] = useState(142);

  const handleEmitInvoice = () => {
    if (demoInvoiceState !== 'idle') return;
    setDemoInvoiceState('loading');
    setTimeout(() => {
      setDemoInvoiceState('success');
      setDemoInvoiceCount(prev => prev + 1);
      setTimeout(() => {
        setDemoInvoiceState('idle');
      }, 3000);
    }, 1000);
  };

  useEffect(() => {
    const handleScroll = () => {
      const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 380;
      if (window.scrollY > 400 && !isNearBottom) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // FAQ Data
  const faqs = [
    {
      q: "¿Cómo empiezo?",
      a: "El proceso es simple y rápido. Te registras en nuestra plataforma, configuras los datos de tu empresa, cargas tus productos o servicios, ¡y estarás listo para emitir tu primer comprobante en menos de 10 minutos!"
    },
    {
      q: "¿Se conecta con SUNAT?",
      a: "Sí, izinvoice está 100% homologado y conectado directamente con SUNAT a través de nuestro OSE/PSE autorizado. Todos tus comprobantes se envían y validan de forma oficial en tiempo real."
    },
    {
      q: "¿Puedo migrar desde otro sistema?",
      a: "Por supuesto. Contamos con herramientas de importación masiva mediante Excel para tus clientes, productos e inventarios. Además, nuestro equipo de soporte te acompaña de manera personalizada durante la migración sin costo adicional."
    },
    {
      q: "¿Puedo administrar varias empresas?",
      a: "Sí. Nuestro Plan Empresarial está diseñado específicamente para multiempresa, permitiéndote gestionar múltiples RUCs y cambiar de negocio con un solo clic desde el mismo panel de control."
    },
    {
      q: "¿Funciona desde celular?",
      a: "Sí. La plataforma es totalmente web responsiva, optimizada para funcionar de manera excelente en smartphones, tablets, laptops y computadoras de escritorio, sin necesidad de instalar apps pesadas."
    },
    {
      q: "¿Puedo personalizar mis comprobantes?",
      a: "Sí, puedes cargar tu propio logotipo, elegir entre múltiples plantillas de diseño (A4, A5, Ticket de 80mm/58mm), y configurar colores, cuentas bancarias, términos de pago y mensajes personalizados."
    },
    {
      q: "¿Los documentos se envían automáticamente a SUNAT?",
      a: "Así es. Al momento de dar clic en guardar o emitir, el sistema realiza la firma digital, genera el XML/CDR y lo envía a SUNAT. El cliente recibe su PDF y XML automáticamente en su correo electrónico y por WhatsApp si lo configuras."
    },
    {
      q: "¿Qué soporte ofrecen?",
      a: "Ofrecemos soporte técnico continuo por WhatsApp y correo electrónico para todos nuestros planes. El Plan Ejecutivo y Empresarial cuentan adicionalmente con soporte telefónico y asesoría prioritaria para SUNAT."
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Alejandro Mendoza",
      role: "Gerente General",
      company: "Market & Delivery Express",
      content: "Migrar a izinvoice fue la mejor decisión para nuestro negocio. Emitimos más de 500 boletas diarias desde la caja POS sin ninguna lentitud, y el soporte por WhatsApp nos resolvió las dudas tributarias de inmediato.",
      rating: 5,
      avatar: "AM"
    },
    {
      name: "Sofia Valdivia",
      role: "Fundadora",
      company: "Aura Boutique & Diseños",
      content: "Buscaba un sistema limpio, rápido y con estilo. La mayoría de sistemas de facturación en Perú se ven antiguos, pero izinvoice tiene ese diseño premium tipo Apple que da gusto usar todos los días. ¡Me encanta!",
      rating: 5,
      avatar: "SV"
    },
    {
      name: "Ing. Carlos Reyes",
      role: "Director de Operaciones",
      company: "Ferretería El Progreso SAC",
      content: "La gestión de inventarios combinada con la facturación y guías de remisión en la nube nos permite tener 3 sucursales sincronizadas en tiempo real. Un sistema robusto y sumamente profesional.",
      rating: 5,
      avatar: "CR"
    }
  ];

  // Businesses (Para quién es)
  const businesses = [
    { name: "Minimarkets", icon: "🏪", desc: "Ventas rápidas con lector de código de barras y caja chica." },
    { name: "Tiendas", icon: "👗", desc: "Control de tallas, colores y stock de mercancías en tiempo real." },
    { name: "Restaurantes", icon: "🍔", desc: "Comandas rápidas, división de cuentas y control de insumos." },
    { name: "Ferreterías", icon: "🔧", desc: "Gestión de múltiples unidades de medida (caja, docena, unidad)." },
    { name: "Farmacias", icon: "💊", desc: "Control de fechas de vencimiento y lotes de medicamentos." },
    { name: "Veterinarias", icon: "🐶", desc: "Historial de mascotas asociado a la facturación de servicios." },
    { name: "Peluquerías", icon: "✂️", desc: "Control de comisiones por estilista y reserva de turnos." },
    { name: "Librerías", icon: "📚", desc: "Catálogos amplios de productos y útiles de oficina." },
    { name: "Tecnología", icon: "💻", desc: "Control de números de serie y garantías de equipos." },
    { name: "Licorerías", icon: "🍾", desc: "Cuadre de caja por turnos y control de inventario de botellas." },
    { name: "Grifos", icon: "⛽", desc: "Facturación rápida en playa conectada con surtidores." },
    { name: "Emprendimientos", icon: "🚀", desc: "Comienza formal, emitiendo comprobantes de manera súper fácil." }
  ];

  const row1Modules = [
    { name: "Dashboard", desc: "Panel general de ventas y estado SUNAT.", icon: <LayoutDashboard className="w-5 h-5" />, tag: "Esencial", highlight: true },
    { name: "Clientes", desc: "Directorio inteligente con búsqueda RUC.", icon: <Users className="w-5 h-5" />, tag: "Básico", highlight: false },
    { name: "Inventario", desc: "Control de stock e ingresos/salidas (Kárdex).", icon: <ClipboardList className="w-5 h-5" />, tag: "Adicional", highlight: false },
    { name: "Compras", desc: "Registro de proveedores y gastos mensuales.", icon: <Landmark className="w-5 h-5" />, tag: "Adicional", highlight: false },
    { name: "Reportes", desc: "Descarga de reportes en Excel y PDF.", icon: <BarChart3 className="w-5 h-5" />, tag: "Adicional", highlight: false },
    { name: "Sucursales", desc: "Gestión de múltiples almacenes y tiendas.", icon: <Building2 className="w-5 h-5" />, tag: "Multi-sede", highlight: true }
  ];

  const row2Modules = [
    { name: "Ventas", desc: "Facturas, boletas y cotizaciones rápidas.", icon: <ShoppingCart className="w-5 h-5" />, tag: "Esencial", highlight: true },
    { name: "Productos", desc: "Gestión de catálogo, categorías y precios.", icon: <Package className="w-5 h-5" />, tag: "Básico", highlight: false },
    { name: "Libro de Reclamaciones", desc: "Cumple con las normas vigentes de forma 100% digital.", icon: <MessageSquare className="w-5 h-5" />, tag: "Normativo", highlight: false },
    { name: "Finanzas", desc: "Cuentas por cobrar y control de caja chica.", icon: <RefreshCw className="w-5 h-5" />, tag: "Avanzado", highlight: true },
    { name: "Usuarios", desc: "Roles y permisos del personal (Cajeros, Admin).", icon: <UserCheck className="w-5 h-5" />, tag: "Seguridad", highlight: false },
    { name: "SUNAT", desc: "Historial de CDRs, XMLs y estados oficiales.", icon: <ShieldCheck className="w-5 h-5" />, tag: "Conectores", highlight: false }
  ];

  return (
    <div className="bg-[#f8fafc] text-zinc-900 font-sans min-h-screen relative overflow-hidden antialiased pt-16">
      {/* Background radial effects */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* STICKY NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-zinc-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-[#4f46e5]/5 px-2.5 py-1.5 rounded-lg flex items-center justify-center">
              <img src="/log.png" alt="Logo" className="h-7 w-auto object-contain" />
            </div>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-600">
            <a href="#inicio" className="hover:text-[#4f46e5] transition-colors">Inicio</a>
            <a href="#funciones" className="hover:text-[#4f46e5] transition-colors">Funciones</a>
            <a href="#beneficios" className="hover:text-[#4f46e5] transition-colors">Beneficios</a>
            <a href="#planes" className="hover:text-[#4f46e5] transition-colors">Planes</a>
            <a href="#faq" className="hover:text-[#4f46e5] transition-colors">FAQ</a>
            <a href="#contacto" className="hover:text-[#4f46e5] transition-colors">Contacto</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-4 py-2 border border-zinc-200 hover:border-zinc-300 rounded-xl font-bold text-xs text-zinc-700 hover:bg-zinc-50 transition-all cursor-pointer"
            >
              Ingresar
            </Link>
            <button 
              onClick={() => setDemoModalOpen(true)}
              className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              Solicitar Demo
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button 
            className="md:hidden text-zinc-600 hover:text-zinc-900 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-zinc-200/80 px-6 py-4 space-y-4"
            >
              <div className="flex flex-col gap-3.5 text-sm font-semibold text-zinc-600">
                <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#4f46e5]">Inicio</a>
                <a href="#funciones" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#4f46e5]">Funciones</a>
                <a href="#beneficios" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#4f46e5]">Beneficios</a>
                <a href="#planes" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#4f46e5]">Planes</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#4f46e5]">FAQ</a>
                <a href="#contacto" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#4f46e5]">Contacto</a>
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100">
                <Link 
                  href="/login"
                  className="w-full text-center py-2.5 border border-zinc-200 rounded-xl font-bold text-xs text-zinc-700 bg-zinc-50"
                >
                  Ingresar
                </Link>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setDemoModalOpen(true);
                  }}
                  className="w-full text-center py-2.5 bg-[#4f46e5] text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/10"
                >
                  Solicitar Demo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION (CENTRE GRADIENT CARD - ESTILO RAMPAY) */}
      <section id="inicio" className="max-w-7xl mx-auto px-4 pt-6 relative">
        <div className="bg-gradient-to-br from-[#1e1b4b] via-[#4f46e5] to-[#6366f1] rounded-[40px] text-white overflow-hidden relative shadow-2xl border border-indigo-750/30 px-6 pt-16 pb-36 md:pt-20 md:pb-48 text-center">
          {/* Decorative glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            {/* SUNAT Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/20 rounded-full select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black text-white tracking-widest uppercase">SUNAT CONECTADO PSE/OSE</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-2xl mx-auto">
              El sistema de facturación electrónica que tu empresa necesita
            </h1>

            <p className="text-sm md:text-base text-indigo-100 font-medium leading-relaxed max-w-xl mx-auto">
              Emite comprobantes en segundos, controla tu inventario y gestiona tu negocio en tiempo real. La interfaz premium tipo Apple diseñada para el mercado peruano.
            </p>

            {/* Centered CTA Action */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <Link
                href="/login"
                className="px-8 py-3.5 bg-white hover:bg-zinc-50 text-[#4f46e5] rounded-full font-extrabold text-xs shadow-lg shadow-indigo-900/10 active:scale-[0.98] transition-all cursor-pointer"
              >
                Probar Gratis — Es Gratis
              </Link>
              <button
                onClick={() => setDemoModalOpen(true)}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-full font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                Solicitar Demo
              </button>
            </div>

            {/* Bottom link shortcuts */}
            <div className="flex justify-center gap-6 text-[11px] font-bold text-indigo-200 select-none">
              <a href="#planes" className="hover:text-white transition-colors">Ver Planes</a>
              <span>•</span>
              <a href="#beneficios" className="hover:text-white transition-colors">Ventajas</a>
              <span>•</span>
              <a href="#funciones" className="hover:text-white transition-colors">Funcionalidades</a>
            </div>
          </div>

          {/* OVERLAPPING DASHBOARD CARDS ROW (Half in, half out - Rampay style) */}
          <div className="absolute bottom-0 left-0 right-0 w-full px-6 flex justify-center translate-y-1/2 z-20 select-none">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 w-full max-w-5xl">
              
              {/* Card 1: Left - Caja POS & Ventas */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xl w-[250px] h-[190px] flex flex-col justify-between shrink-0 text-left"
              >
                <div>
                  <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider block">Caja POS Rápida</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <h4 className="text-base font-extrabold text-zinc-800 tracking-tight">S/ 12,450.40</h4>
                    <span className="text-[7px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded-full uppercase">
                      +15.4%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 border-t border-zinc-50 pt-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 font-semibold flex items-center gap-1">🟢 Cobro POS</span>
                    <span className="font-bold text-zinc-800">+S/ 150.00</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 font-semibold flex items-center gap-1">🔴 Gasto Almacén</span>
                    <span className="font-bold text-zinc-800">-S/ 400.00</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[8px] font-extrabold text-zinc-400 border-t border-zinc-50 pt-2">
                  <span>CAJA DIARIA</span>
                  <span className="text-[#4f46e5]">CUADRADO OK</span>
                </div>
              </motion.div>

              {/* Card 2: Center - Core Dashboard Window (Taller Centerpiece) */}
              <motion.div 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="bg-white border border-zinc-200 rounded-[22px] shadow-2xl w-[320px] h-[230px] flex flex-col justify-between shrink-0 relative overflow-hidden text-left"
              >
                {/* Browser window header */}
                <div className="bg-zinc-50 border-b border-zinc-150 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80 block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400/80 block" />
                  </div>
                  <div className="text-[8px] font-bold text-zinc-400 bg-zinc-200/40 px-3 py-0.5 rounded border border-zinc-200/50">
                    app.izinvoice.pe/dashboard
                  </div>
                  <div className="w-10" />
                </div>

                {/* Dashboard mock content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-center pb-2">
                    <div>
                      <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider block">Consola Principal</span>
                      <h5 className="text-[11px] font-bold text-zinc-800 tracking-tight">Mi Empresa S.A.C.</h5>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-full">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[7px] font-black text-emerald-700 uppercase">SUNAT OK</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-50">
                    <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-zinc-100/60">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-indigo-50 text-[#4f46e5] font-extrabold px-1 rounded text-[8px]">F001-492</span>
                        <span className="font-semibold text-zinc-600 truncate max-w-[110px]">Corp. Andina S.A.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-zinc-800">S/ 4,500</span>
                        <span className="text-[7px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-200/60">CDR OK</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-indigo-50 text-[#4f46e5] font-extrabold px-1 rounded text-[8px]">B001-8302</span>
                        <span className="font-semibold text-zinc-600 truncate max-w-[110px]">Juan Pérez Quispe</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-zinc-800">S/ 120</span>
                        <span className="text-[7px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-200/60">CDR OK</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[8px] font-bold text-center text-zinc-400 border-t border-zinc-50 pt-2.5">
                    ÚLTIMAS FACTURAS EMITIDAS
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Right - Inventario & Kárdex */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xl w-[250px] h-[190px] flex flex-col justify-between shrink-0 text-left"
              >
                <div>
                  <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider block">Inventario & Stock</span>
                  <h4 className="font-extrabold text-xs text-zinc-800 tracking-tight mt-0.5">Control de Almacén</h4>
                </div>
                
                <div className="space-y-3 pt-2 border-t border-zinc-50">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-zinc-500">
                      <span>Papel Térmico 80mm</span>
                      <span className="text-amber-600 font-bold">5 und</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[20%] rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-zinc-500">
                      <span>Scanner USB</span>
                      <span className="text-emerald-600 font-bold">12 und</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[80%] rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 p-1.5 rounded-lg mt-1 text-[8px] text-amber-700 font-bold">
                  ⚠️ ALERTA: Stock bajo en Papel Térmico
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* SECTION BELOW HERO: HEADER & CAPSULE STATISTICS (Rampay style) */}
      <section className="max-w-7xl mx-auto px-6 pt-36 pb-12 md:pt-48 select-none">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2.5 max-w-xl">
            <span className="text-[10px] font-bold text-[#4f46e5] bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Métricas de Confianza
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
              Desbloquea el poder de tus <span className="text-[#4f46e5]">datos comerciales</span>
            </h2>
            <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
              Únete a miles de empresas peruanas que ya simplifican sus procesos de emisión de comprobantes, inventarios y caja chica con izinvoice.
            </p>
          </div>
          <Link
            href="/login"
            className="shrink-0 px-5 py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            Comenzar Prueba Gratis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Emitidos Hoy",
              val: "+10,000",
              sub: "Documentos",
              icon: <Zap className="w-5 h-5 text-indigo-600" />,
              bg: "bg-indigo-50/50"
            },
            {
              title: "Uptime del Sistema",
              val: "99.9%",
              sub: "Disponibilidad",
              icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
              bg: "bg-emerald-50/50"
            },
            {
              title: "Nube de Alta Velocidad",
              val: "24/7",
              sub: "Acceso Seguro",
              icon: <Cloud className="w-5 h-5 text-sky-600" />,
              bg: "bg-sky-50/50"
            },
            {
              title: "Homologado SUNAT",
              val: "100%",
              sub: "Conexión PSE/OSE",
              icon: <Building className="w-5 h-5 text-purple-600" />,
              bg: "bg-purple-50/50"
            }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">{stat.title}</span>
                <span className="font-black text-sm text-zinc-800 tracking-tight flex items-baseline gap-1 mt-0.5">
                  {stat.val} <span className="text-[9px] font-semibold text-zinc-500">{stat.sub}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="beneficios" className="max-w-7xl mx-auto px-4 mt-16 mb-8 md:mt-24 md:mb-12 relative">
        <div className="bg-white border border-zinc-200/80 rounded-[40px] shadow-2xl px-6 py-16 md:py-24 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Columna Izquierda: Información de Ventajas */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] font-bold text-[#4f46e5] bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Ventajas Competitivas
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight leading-[1.15]">
              Tu negocio en tiempo real. <br />
              <span className="text-[#4f46e5]">Sin complicaciones.</span>
            </h2>
            <p className="text-zinc-500 font-medium text-sm leading-relaxed">
              Izinvoice no es solo un facturador electrónico homologado por SUNAT. Es el centro neurálgico de tu negocio, diseñado con un panel premium tipo Apple que te permite tomar decisiones basadas en datos al instante.
            </p>

            <div className="space-y-4 pt-2">
              {[
                {
                  title: "Emisión en 3 Clics",
                  desc: "Genera facturas, boletas y notas de crédito en tiempo récord con autocompletado inteligente RUC/DNI.",
                  icon: <Zap className="w-4 h-4 text-indigo-600" />,
                  bg: "bg-indigo-50 border-indigo-100"
                },
                {
                  title: "Control de Caja y Turnos",
                  desc: "Supervisa arqueos automáticos, flujo de caja chica e ingresos diarios sin descuadres.",
                  icon: <Landmark className="w-4 h-4 text-emerald-600" />,
                  bg: "bg-emerald-50 border-emerald-100"
                },
                {
                  title: "Conectado al 100% con SUNAT",
                  desc: "Respuesta de aceptación instantánea (XML/CDR oficiales) gracias a nuestra infraestructura OSE/PSE.",
                  icon: <ShieldCheck className="w-4 h-4 text-sky-600" />,
                  bg: "bg-sky-50 border-sky-100"
                },
                {
                  title: "Reportes Listos para Contabilidad",
                  desc: "Exporta libros de venta oficiales (SIRE) e impuestos mensuales en un solo clic.",
                  icon: <BarChart3 className="w-4 h-4 text-purple-600" />,
                  bg: "bg-purple-50 border-purple-100"
                }
              ].map((feat, idx) => (
                <div key={idx} className="flex gap-4 items-start group">
                  <div className={`w-8 h-8 rounded-lg ${feat.bg} border flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-200`}>
                    {feat.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-xs text-zinc-800 tracking-tight group-hover:text-[#4f46e5] transition-colors duration-200">
                      {feat.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Mini Dashboard Widget Grid (Estilo Apple) */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-[32px] p-6 shadow-2xl relative overflow-hidden group/board">
              {/* Decorative glows */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-[48px] pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-[48px] pointer-events-none" />

              {/* Dashboard Browser Header Bar */}
              <div className="flex items-center justify-between border-b border-zinc-200/80 pb-5 mb-5 select-none">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-zinc-200 block" />
                  <span className="w-3 h-3 rounded-full bg-zinc-200 block" />
                  <span className="w-3 h-3 rounded-full bg-zinc-200 block" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Console v1.4</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-zinc-500 bg-white border border-zinc-200 px-2.5 py-1 rounded-full uppercase">
                    Matriz Lima
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] flex items-center justify-center text-[10px] font-black">
                    A
                  </div>
                  <Settings className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 transition-colors" />
                </div>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* WIDGET 1: Welcome & Notifications (Welcome Mohammad card) */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4f46e5]/10 flex items-center justify-center text-[#4f46e5] shrink-0 text-sm">
                      👤
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Sesión Activa</span>
                      <h4 className="font-extrabold text-xs text-zinc-800 tracking-tight">Bienvenido de vuelta, Admin!</h4>
                    </div>
                  </div>
                  <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 flex gap-2.5 items-start">
                    <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                    <p className="text-[10px] text-zinc-600 font-medium leading-normal">
                      <strong>Alerta Stock:</strong> Quedan 5 bobinas de <span className="text-amber-700 font-bold">Papel Térmico 80mm</span> en almacén.
                    </p>
                  </div>
                </div>

                {/* WIDGET 2: SUNAT Connection Status (7:23 am Tuesday card) */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Servidor SUNAT</span>
                      <h4 className="font-extrabold text-xs text-zinc-800 tracking-tight mt-0.5">Conexión Homologada</h4>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[7px] font-black text-emerald-700 uppercase tracking-wider">Activo</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-zinc-50 flex items-baseline justify-between mt-3">
                    <div>
                      <span className="text-[20px] font-black text-zinc-800 tracking-tighter">0.28s</span>
                      <span className="text-[9px] text-zinc-400 font-bold block">Tiempo de respuesta</span>
                    </div>
                    <span className="text-[8px] font-extrabold text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded uppercase">
                      PSE/OSE OK
                    </span>
                  </div>
                </div>

                {/* WIDGET 3: Emisión Express (Quick Money Transfer card) */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Emisión Express</span>
                    <h4 className="font-extrabold text-xs text-zinc-800 tracking-tight mt-0.5">Simulador de Facturación</h4>
                  </div>
                  
                  {/* Fake Client Selection Bubble */}
                  <div className="flex items-center justify-between bg-zinc-50 border border-zinc-150 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-[9px] font-bold">
                        CA
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-700">Constructora Alpha</span>
                    </div>
                    <span className="text-[8px] font-bold text-zinc-400">RUC: 20601...</span>
                  </div>

                  {/* Interactive Button */}
                  <button
                    onClick={handleEmitInvoice}
                    disabled={demoInvoiceState === 'loading'}
                    className={`w-full py-2.5 rounded-xl text-[10px] font-bold tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                      demoInvoiceState === 'idle'
                        ? 'bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-md shadow-indigo-500/10 cursor-pointer'
                        : demoInvoiceState === 'loading'
                        ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                        : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10 cursor-default'
                    }`}
                  >
                    {demoInvoiceState === 'idle' && (
                      <>
                        Emitir Factura S/ 2,450.00 <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                    {demoInvoiceState === 'loading' && (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" /> Firmando XML y CDR...
                      </>
                    )}
                    {demoInvoiceState === 'success' && (
                      <>
                        ✓ Comprobante Aceptado por SUNAT!
                      </>
                    )}
                  </button>
                </div>

                {/* WIDGET 4: Sales & Bar Chart (Avg Balance card) */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Ventas de Hoy</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <h4 className="text-lg font-black text-zinc-800 tracking-tight">S/ 12,850.40</h4>
                        <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full uppercase">
                          +15.4%
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
                      {demoInvoiceCount} emitidos
                    </span>
                  </div>

                  {/* Micro Bar Chart */}
                  <div className="h-16 flex items-end justify-between gap-1 pt-2 select-none">
                    {[
                      { month: "Ene", height: "h-[30%]" },
                      { month: "Feb", height: "h-[50%]" },
                      { month: "Mar", height: "h-[75%]" },
                      { month: "Abr", height: "h-[65%]" },
                      { month: "May", height: "h-[85%]" },
                      { month: "Jun", height: "h-[98%]" }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group/bar">
                        <div className="w-full bg-zinc-100 rounded-t-sm h-14 flex items-end overflow-hidden">
                          <div className={`w-full bg-zinc-200 group-hover/bar:bg-[#4f46e5] rounded-t-sm transition-all duration-300 ${bar.height} ${
                            idx === 5 ? 'bg-[#4f46e5]/70' : ''
                          }`} />
                        </div>
                        <span className="text-[8px] font-semibold text-zinc-400">{bar.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>
      {/* SECCIÓN MÓDULOS (GRID PREMIUM) */}
      <section id="funciones" className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-100">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-light text-zinc-900 tracking-tight leading-tight">
            Módulos adicionales a tu medida
          </h2>
          <p className="text-zinc-500 font-medium text-[15px] md:text-base leading-relaxed">
            Personaliza tu experiencia agregando funciones avanzadas de forma modular. Adquiere solo lo que tu negocio necesita con una pequeña inversión adicional.
          </p>
        </div>

        {/* Infinite scrolling Apple-style carousel */}
        <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] overflow-hidden space-y-6 py-4">
          {/* Row 1: Left scrolling */}
          <div className="flex w-full overflow-hidden select-none">
            <div className="animate-marquee-left flex w-max gap-6 px-3 pause-hover">
              {[...row1Modules, ...row1Modules].map((mod, idx) => (
                <div
                  key={idx}
                  className={`w-[260px] h-[135px] rounded-[28px] p-6 flex flex-col justify-between shrink-0 transition-all border ${
                    mod.highlight
                      ? 'bg-[#4f46e5] text-white border-transparent shadow-lg shadow-indigo-500/10 hover:bg-[#4338ca]'
                      : 'bg-white text-zinc-700 border-zinc-200/80 hover:border-[#4f46e5]/40 hover:shadow-xl hover:shadow-indigo-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      mod.highlight ? 'bg-white/10 text-white' : 'bg-zinc-50 border border-zinc-155 text-zinc-500'
                    }`}>
                      {mod.icon}
                    </div>
                    <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      mod.highlight
                        ? 'bg-white/15 text-white border-white/20'
                        : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                    }`}>
                      {mod.tag}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-extrabold text-xs tracking-tight ${mod.highlight ? 'text-white' : 'text-zinc-800'}`}>
                      {mod.name}
                    </h3>
                    <p className={`text-[10px] font-medium leading-tight ${mod.highlight ? 'text-white/80' : 'text-zinc-450'}`}>
                      {mod.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Right scrolling */}
          <div className="flex w-full overflow-hidden select-none">
            <div className="animate-marquee-right flex w-max gap-6 px-3 pause-hover">
              {[...row2Modules, ...row2Modules].map((mod, idx) => (
                <div
                  key={idx}
                  className={`w-[260px] h-[135px] rounded-[28px] p-6 flex flex-col justify-between shrink-0 transition-all border ${
                    mod.highlight
                      ? 'bg-[#4f46e5] text-white border-transparent shadow-lg shadow-indigo-500/10 hover:bg-[#4338ca]'
                      : 'bg-white text-zinc-700 border-zinc-200/80 hover:border-[#4f46e5]/40 hover:shadow-xl hover:shadow-indigo-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      mod.highlight ? 'bg-white/10 text-white' : 'bg-zinc-50 border border-zinc-155 text-zinc-500'
                    }`}>
                      {mod.icon}
                    </div>
                    <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      mod.highlight
                        ? 'bg-white/15 text-white border-white/20'
                        : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                    }`}>
                      {mod.tag}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-extrabold text-xs tracking-tight ${mod.highlight ? 'text-white' : 'text-zinc-800'}`}>
                      {mod.name}
                    </h3>
                    <p className={`text-[10px] font-medium leading-tight ${mod.highlight ? 'text-white/80' : 'text-zinc-450'}`}>
                      {mod.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MindDev custom systems banner */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-100/60 px-2.5 py-1 rounded-full uppercase tracking-wider">Soluciones a Medida</span>
            <h3 className="text-base font-extrabold text-zinc-900 tracking-tight">¿Necesitas una Web, Carrito de Compras o Sistema Personalizado?</h3>
            <p className="text-xs text-zinc-500 font-medium max-w-2xl leading-relaxed">
              De la mano de **MindDev**, diseñamos y desarrollamos páginas web corporativas, tiendas virtuales (E-commerce) con carritos de compra y sistemas integrados a la medida de los requerimientos de tu negocio.
            </p>
          </div>
          <a
            href="https://www.minddev.pe"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            Saber más en MindDev <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* SECCIÓN CARACTERÍSTICAS (BENTO GRID - ESTILO OYEE) */}
      <section className="max-w-7xl mx-auto px-6 py-24 bg-[#f8fafc]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-[10px] font-bold text-[#4f46e5] bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Características de Alto Nivel
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Potencia tu negocio con herramientas profesionales
          </h2>
          <p className="text-zinc-500 font-medium text-sm">
            Diseñadas y optimizadas bajo estándares premium para la realidad comercial del mercado peruano.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* COLUMNA 1 (Izquierda) - Contiene 3 tarjetas apiladas */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            {/* Tarjeta 1.1: Logo Marca (izinvoice simple, fondo índigo oscuro) */}
            <motion.div 
              whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
              className="bg-[#1e1b4b] rounded-[32px] p-6 h-[150px] flex flex-col justify-center items-center relative overflow-hidden border border-indigo-950/20 shadow-md group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 group-hover:scale-105 transition-transform duration-300">
                <img src="/log.png" alt="Logo" className="h-8 w-auto object-contain brightness-0 invert" />
              </div>
            </motion.div>

            {/* Tarjeta 1.2: Mockup de Teléfono con Notificación */}
            <motion.div 
              whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
              className="bg-[#4f46e5] rounded-[32px] p-6 h-[220px] relative overflow-hidden shadow-lg border border-indigo-600/30 flex flex-col justify-between group"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[8px] text-indigo-200 font-extrabold uppercase tracking-wider block">Notificaciones SUNAT</span>
                  <h4 className="text-white text-xs font-black">Estado del Emisor</h4>
                </div>
                <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-black animate-pulse">
                  4
                </div>
              </div>

              {/* Mockup Celular */}
              <div className="w-[180px] h-[130px] bg-zinc-950 rounded-t-3xl border-t-4 border-x-4 border-zinc-800 mx-auto mt-2 relative pt-3 px-3 shadow-2xl flex flex-col gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-1" />
                {/* App icon inside phone */}
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1.5 rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-[#4f46e5] flex items-center justify-center text-[9px] font-black text-white shrink-0">
                    iz
                  </div>
                  <div className="min-w-0">
                    <span className="text-[7px] text-zinc-400 font-bold block leading-none">Mi Empresa SAC</span>
                    <span className="text-[8px] text-emerald-400 font-extrabold leading-none">SUNAT: Aceptada 🟢</span>
                  </div>
                </div>
                {/* Notification toast inside phone */}
                <div className="bg-white/10 border border-white/5 p-1.5 rounded-lg text-[6.5px] text-zinc-300 leading-normal">
                  Factura <strong>F001-0028</strong> firmada digitalmente y enviada a SUNAT.
                </div>
              </div>
            </motion.div>

            {/* Tarjeta 1.3: Multiempresa / Abstract pattern */}
            <motion.div 
              whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
              className="bg-white border border-zinc-200 rounded-[32px] p-6 h-[170px] flex flex-col justify-between relative overflow-hidden shadow-md"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-xl pointer-events-none" />
              <div>
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase tracking-wider block">Multiempresa</span>
                <h4 className="text-zinc-800 text-xs font-black mt-0.5">Controla múltiples RUCs</h4>
              </div>
              
              <div className="flex gap-2 items-end pt-3 overflow-hidden h-[80px] relative">
                {/* Mock card 1 */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 w-[110px] shrink-0 transform -rotate-6 translate-y-2 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[7px] font-bold text-zinc-600 truncate">Empresa Alfa</span>
                  </div>
                  <span className="text-[6px] text-zinc-400 font-mono block mt-1">20601482921</span>
                </div>
                {/* Mock card 2 */}
                <div className="bg-white border border-zinc-200 rounded-xl p-2.5 w-[110px] shrink-0 transform rotate-3 translate-x-2 translate-y-1 shadow-md relative z-10">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-[7px] font-black text-zinc-700 truncate">Corp. Beta SAC</span>
                  </div>
                  <span className="text-[6px] text-zinc-500 font-mono block mt-1">20593029103</span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* COLUMNA 2 (Centro) - Contiene 3 tarjetas apiladas */}
          <div className="md:col-span-5 flex flex-col gap-6">
            
            {/* Tarjeta 2.1: Typography card (Fondo crema/claro, palabras destacadas tipo pill) */}
            <motion.div 
              whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
              className="bg-[#fcfbf9] border border-zinc-200/65 rounded-[32px] p-8 flex-1 flex flex-col justify-center text-left relative overflow-hidden shadow-md"
            >
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-black text-zinc-800 leading-[1.4] tracking-tight">
                  Simplifica tu <span className="inline-block px-3 py-0.5 bg-[#4f46e5] text-white text-xs md:text-sm font-bold rounded-full uppercase tracking-wider mx-1">facturación</span> y controla tu <span className="inline-block px-3 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs md:text-sm font-bold rounded-full uppercase tracking-wider mx-1">inventario</span> en tiempo <span className="inline-block px-3 py-0.5 border border-zinc-300 text-zinc-600 text-xs md:text-sm font-bold rounded-full uppercase tracking-wider mx-1">real</span> con una plataforma ágil.
                </h3>
                <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                  Homologación certificada por SUNAT (PSE/OSE). Firma digital y envío instantáneo de CDR para que nunca te detengas.
                </p>
              </div>
            </motion.div>

            {/* Tarjeta 2.2: Mini iconos interactivos (Fondo morado claro, iconos de contorno limpios) */}
            <motion.div 
              whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
              className="bg-indigo-50/70 border border-indigo-100 rounded-[32px] p-6 h-[180px] flex items-center justify-around shadow-sm"
            >
              {[
                { name: "Caja POS", icon: <ShoppingCart className="w-6 h-6 text-[#4f46e5]" />, label: "Venta Rápida" },
                { name: "Kárdex", icon: <Package className="w-6 h-6 text-[#4f46e5]" />, label: "Stock Mínimo" },
                { name: "Reportes", icon: <BarChart3 className="w-6 h-6 text-[#4f46e5]" />, label: "SIRE Excel" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 group/icon">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center shadow-sm group-hover/icon:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <span className="text-[9px] font-black text-zinc-700 tracking-tight">{item.name}</span>
                  <span className="text-[8px] font-bold text-zinc-400 leading-none">{item.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Tarjeta 2.3: Barra Horizontal de CTA */}
            <motion.div 
              whileHover={{ y: -3 }}
              className="bg-[#1e1b4b] rounded-[20px] p-4 flex items-center justify-between text-white border border-indigo-950/40 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[9px] font-black tracking-wider text-indigo-200 uppercase">PROBAR IZINVOICE HOY</span>
              </div>
              <Link 
                href="/login" 
                className="px-4 py-2 bg-white hover:bg-zinc-50 text-[#4f46e5] rounded-full font-extrabold text-[9px] shadow-md transition-all active:scale-[0.98]"
              >
                Es Gratis ⚡
              </Link>
            </motion.div>

          </div>

          {/* COLUMNA 3 (Derecha) - Tarjeta vertical alta */}
          <div className="md:col-span-3 flex">
            
            {/* Tarjeta 3.1: Tarjeta alta estilo ticket de compras (Ventas fluyen natural) */}
            <motion.div 
              whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15)" }}
              className="bg-gradient-to-b from-indigo-500 to-[#4f46e5] text-white rounded-[32px] p-6 flex-1 flex flex-col justify-between relative overflow-hidden shadow-lg border border-indigo-600/50"
            >
              <div className="absolute -bottom-8 -right-8 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-3">
                <span className="text-[8px] text-indigo-200 font-extrabold uppercase tracking-wider block">Facturación Móvil</span>
                <h3 className="text-xl font-black leading-tight tracking-tight">Tus ventas fluyen de forma natural</h3>
                <p className="text-[10px] text-indigo-100 font-semibold leading-relaxed">
                  Genera boletas térmicas de 80mm o formato A4 en un solo toque desde tu smartphone o tablet en el punto de venta.
                </p>
              </div>

              {/* Mockup Ticket - Rediseñado para coincidir con el TicketViewer oficial */}
              <div className="bg-white text-zinc-900 rounded-2xl p-4 my-5 shadow-2xl relative border border-zinc-200 font-mono text-[8px] select-none text-left leading-normal flex flex-col justify-between shrink-0">
                {/* Header Info */}
                <div className="text-center space-y-0.5">
                  <div className="flex justify-center mb-1">
                    <div className="w-6 h-6 rounded-full bg-[#4f46e5] flex items-center justify-center font-bold text-white text-[9px]">
                      IZ
                    </div>
                  </div>
                  <p className="font-extrabold text-[9px] uppercase tracking-tight text-zinc-950">MI EMPRESA S.A.C.</p>
                  <p className="text-zinc-500 font-semibold">R.U.C. 20601482921</p>
                  <p className="text-zinc-400 text-[7px] leading-none">Av. Javier Prado Este 1024, Lima</p>
                </div>

                {/* Dashed Separator */}
                <div className="border-t border-dashed border-zinc-200 my-1.5" />

                {/* Doc Title & Number */}
                <div className="text-center space-y-0.5">
                  <p className="font-extrabold text-zinc-800 uppercase text-[8px]">
                    BOLETA DE VENTA ELECTRÓNICA
                  </p>
                  <p className="font-black text-zinc-950 text-[9px] tracking-wider">
                    B001-00083920
                  </p>
                </div>

                {/* Dashed Separator */}
                <div className="border-t border-dashed border-zinc-200 my-1.5" />

                {/* Meta details */}
                <div className="space-y-0.5 text-zinc-600 font-medium">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-bold uppercase text-[6.5px]">F.Emisión:</span>
                    <span>2026-06-03</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-bold uppercase text-[6.5px]">Moneda:</span>
                    <span>PEN</span>
                  </div>
                  <div className="border-t border-zinc-100/60 pt-1 mt-1 space-y-0.5">
                    <p className="font-bold text-zinc-900 text-[7.5px] truncate">
                      Juan Pérez Quispe
                    </p>
                    <p className="text-zinc-500 text-[7px]">
                      D.N.I. 47382910
                    </p>
                  </div>
                </div>

                {/* Dashed Separator */}
                <div className="border-t border-dashed border-zinc-200 my-1.5" />

                {/* Items List */}
                <table className="w-full text-[7.5px]">
                  <thead>
                    <tr className="text-zinc-400 border-b border-zinc-100 pb-0.5 text-[6.5px] uppercase tracking-wider text-left">
                      <th className="text-center font-bold w-4">Cant</th>
                      <th className="font-bold">Desc.</th>
                      <th className="text-right font-bold w-8">P.U.</th>
                      <th className="text-right font-bold w-10">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-800 font-medium">
                    <tr className="align-top">
                      <td className="text-center py-0.5">1</td>
                      <td className="py-0.5 truncate max-w-[80px]">Papel Térmico 80mm</td>
                      <td className="text-right py-0.5">12.00</td>
                      <td className="text-right font-bold py-0.5 text-zinc-950">12.00</td>
                    </tr>
                    <tr className="align-top">
                      <td className="text-center py-0.5">2</td>
                      <td className="py-0.5 truncate max-w-[80px]">Lector Código Barras</td>
                      <td className="text-right py-0.5">90.00</td>
                      <td className="text-right font-bold py-0.5 text-zinc-950">180.00</td>
                    </tr>
                  </tbody>
                </table>

                {/* Dashed Separator */}
                <div className="border-t border-dashed border-zinc-200 my-1.5" />

                {/* Calculations */}
                <div className="space-y-0.5 text-zinc-700 text-[7.5px] font-medium">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-bold uppercase text-[6.5px]">Op. Gravada:</span>
                    <span>PEN 162.71</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-bold uppercase text-[6.5px]">I.G.V. (18%):</span>
                    <span>PEN 29.29</span>
                  </div>
                  <div className="flex justify-between text-[8.5px] font-black text-zinc-950 pt-0.5 border-t border-zinc-100">
                    <span>TOTAL:</span>
                    <span>PEN 192.00</span>
                  </div>
                </div>

                {/* Dashed Separator */}
                <div className="border-t border-dashed border-zinc-200 my-2" />

                {/* QR Code and Printed Representation */}
                <div className="text-center space-y-1">
                  <div className="flex justify-center">
                    <QrCode className="w-8 h-8 text-zinc-800" />
                  </div>
                  <div className="text-[6px] text-zinc-400 leading-tight space-y-0.5 font-bold">
                    <p className="text-zinc-600">Representación impresa</p>
                    <p>Hash: E8B9F2A1</p>
                    <p className="text-emerald-600 uppercase font-black">SUNAT: ACEPTADO</p>
                  </div>
                </div>
              </div>

              {/* Website Badge */}
              <div className="bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-center text-[9px] font-extrabold tracking-wide hover:bg-white/20 transition-all select-none">
                🔗 app.izinvoice.pe
              </div>

            </motion.div>

          </div>

        </div>
      </section>

      {/* SECCIÓN PARA QUIÉN ES */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-100">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Pensado para todo tipo de negocio
          </h2>
          <p className="text-zinc-500 font-medium text-sm">
            Nuestra flexibilidad nos permite adaptarnos a diferentes dinámicas de venta y control.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {businesses.map((bus, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, scale: 1.02, borderColor: "#4f46e5/30", boxShadow: "0 15px 30px -10px rgba(79, 70, 229, 0.05)" }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white border border-zinc-200 p-6 rounded-2xl text-center space-y-4 transition-colors duration-150 flex flex-col items-center justify-between group"
            >
              <div className="space-y-3 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-2xl group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors duration-200">
                  {bus.icon}
                </div>
                <h3 className="font-extrabold text-zinc-900 text-sm tracking-tight group-hover:text-[#4f46e5] transition-colors duration-200">
                  {bus.name}
                </h3>
              </div>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed mt-2 pt-2 border-t border-zinc-50 group-hover:border-indigo-50/50 transition-colors duration-200 text-center w-full">
                {bus.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* SECCIÓN PLANES */}
      <section id="planes" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Planes a la medida de tu crecimiento
          </h2>
          <p className="text-zinc-500 font-medium text-sm">
            Sin contratos obligatorios. Sencillo, transparente y sin cargos ocultos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {/* Plan Emprende */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">PLAN EMPRENDE</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold text-zinc-900">S/39</span>
                  <span className="text-xs text-zinc-400 font-medium">/ mes</span>
                </div>
                <p className="text-xs text-zinc-500 font-medium mt-1">Ideal para pequeños negocios.</p>
              </div>

              <div className="w-full h-[1px] bg-zinc-150" />

              <ul className="space-y-3">
                {["Facturación ilimitada", "1 sucursal", "5 usuarios", "POS integrado", "Clientes ilimitados", "Reportes básicos"].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link 
              href="/login" 
              className="w-full text-center mt-8 py-3 border border-zinc-200 hover:border-zinc-300 rounded-xl font-bold text-xs text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-colors"
            >
              Comenzar Ahora
            </Link>
          </div>

          {/* Plan Ejecutivo */}
          <div className="bg-white border-2 border-[#4f46e5] rounded-2xl p-8 flex flex-col justify-between relative shadow-xl shadow-indigo-500/5">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#4f46e5] text-white px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1 shadow-md shadow-indigo-500/10">
              <Star className="w-3 h-3 fill-white" /> Más Popular
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#4f46e5] uppercase tracking-wider">PLAN EJECUTIVO</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold text-zinc-900">S/69</span>
                  <span className="text-xs text-zinc-400 font-medium">/ mes</span>
                </div>
                <p className="text-xs text-zinc-500 font-medium mt-1">Ideal para empresas en crecimiento.</p>
              </div>

              <div className="w-full h-[1px] bg-zinc-150" />

              <ul className="space-y-3">
                {["Facturación ilimitada", "4 sucursales", "Usuarios ilimitados", "Inventario & Kardex", "Gestión de Compras", "Finanzas & Bancos", "Soporte Prioritario"].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link 
              href="/login" 
              className="w-full text-center mt-8 py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all"
            >
              Comenzar Ahora
            </Link>
          </div>

          {/* Plan Empresarial */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">PLAN EMPRESARIAL</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold text-zinc-900">S/99</span>
                  <span className="text-xs text-zinc-400 font-medium">/ mes</span>
                </div>
                <p className="text-xs text-zinc-500 font-medium mt-1">Ideal para empresas que requieren control total.</p>
              </div>

              <div className="w-full h-[1px] bg-zinc-150" />

              <ul className="space-y-3">
                {["Multiempresa (Varios RUCs)", "Sucursales ilimitadas", "Usuarios ilimitados", "SIRE SUNAT integrado", "Inventario Avanzado", "Reportes dinámicos", "Asesoría contable"].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link 
              href="/login" 
              className="w-full text-center mt-8 py-3 border border-zinc-200 hover:border-zinc-300 rounded-xl font-bold text-xs text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-colors"
            >
              Comenzar Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* SECCIÓN TESTIMONIOS */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-100">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Empresas que ya confían en izinvoice
          </h2>
          <p className="text-zinc-500 font-medium text-sm">
            Nuestros clientes avalan la rapidez de nuestra interfaz y la tranquilidad tributaria que ofrecemos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex gap-1">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-zinc-600 font-medium text-xs leading-relaxed italic">
                  "{test.content}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 mt-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#4f46e5] font-bold text-xs flex items-center justify-center">
                  {test.avatar}
                </div>
                <div>
                  <h4 className="font-extrabold text-zinc-800 text-xs">{test.name}</h4>
                  <p className="text-[10px] text-zinc-400 font-semibold">{test.role} - {test.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* FAQ SECTION */}
      <section id="faq" className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-100">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Sidebar / Left Column */}
          <div className="md:col-span-4 space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-[#4f46e5] bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Resolviendo Dudas
              </span>
              <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                Preguntas Frecuentes
              </h2>
              <p className="text-zinc-500 font-medium text-xs leading-relaxed">
                ¿Tienes alguna duda sobre el funcionamiento de la facturación electrónica o sobre cómo izinvoice se integra con SUNAT? Aquí tienes las respuestas.
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-zinc-800 text-xs">¿Aún con dudas?</h4>
                  <p className="text-[9px] text-zinc-400 font-semibold">Soporte rápido en minutos.</p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                Nuestro equipo comercial y de soporte técnico tributario está listo para responder todas tus preguntas de forma directa.
              </p>
              <a
                href="https://wa.me/51987654321"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 bg-emerald-550 hover:bg-emerald-600 bg-emerald-600 text-white rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                Escríbenos a WhatsApp
              </a>
            </div>
          </div>

          {/* Accordion / Right Column */}
          <div className="md:col-span-8 space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                    isOpen 
                      ? 'border-[#4f46e5] shadow-lg shadow-indigo-500/5' 
                      : 'border-zinc-200 hover:border-zinc-350'
                  }`}
                >
                  <button
                    className="w-full px-6 py-4 text-left font-bold text-xs text-zinc-800 flex justify-between items-center transition-colors hover:bg-zinc-50/50"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                  >
                    <span className={`transition-colors duration-200 ${isOpen ? 'text-[#4f46e5]' : 'text-zinc-800'}`}>
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#4f46e5]' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="border-t border-zinc-100 bg-zinc-50/30"
                      >
                        <p className="px-6 py-4 text-xs text-zinc-500 font-medium leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* FINAL CTA */}
      <section id="contacto" className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-100">
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-16 text-center space-y-6 max-w-4xl mx-auto shadow-xl relative overflow-hidden">
          <div className="absolute top-[-30%] left-[-20%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-[-30%] right-[-20%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
              Empieza a facturar de manera inteligente
            </h2>
            <p className="text-zinc-500 font-medium text-sm max-w-xl mx-auto">
              Únete a las empresas que ya simplifican sus procesos contables y administrativos con izinvoice.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
              <button 
                onClick={() => setDemoModalOpen(true)}
                className="px-6 py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all"
              >
                Solicitar Demo
              </button>
              <Link 
                href="/login" 
                className="px-6 py-3.5 border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 rounded-xl font-bold text-xs transition-all"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-zinc-200 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-[#4f46e5]/5 px-2.5 py-1.5 rounded-lg flex items-center justify-center">
                <img src="/log.png" alt="Logo" className="h-7 w-auto object-contain" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
              Facturación electrónica moderna para empresas peruanas. Autorizado por SUNAT. Un producto de <a href="https://www.minddev.pe" target="_blank" rel="noopener noreferrer" className="text-[#4f46e5] font-semibold hover:underline">MindDev</a>.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Enlaces</h4>
            <div className="flex flex-col gap-2 text-xs font-semibold text-zinc-500">
              <a href="#inicio" className="hover:text-[#4f46e5] transition-colors">Inicio</a>
              <a href="#funciones" className="hover:text-[#4f46e5] transition-colors">Funciones</a>
              <a href="#planes" className="hover:text-[#4f46e5] transition-colors">Planes</a>
              <a href="#contacto" className="hover:text-[#4f46e5] transition-colors">Contacto</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Soporte y Legal</h4>
            <div className="flex flex-col gap-2 text-xs font-semibold text-zinc-500">
              <a href="#" className="hover:text-[#4f46e5] transition-colors">Términos del Servicio</a>
              <a href="#" className="hover:text-[#4f46e5] transition-colors">Políticas de Privacidad</a>
              <a href="#" className="hover:text-[#4f46e5] transition-colors">Libro de Reclamaciones</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Contacto</h4>
            <div className="text-xs text-zinc-500 font-semibold space-y-1">
              <p>📍 Av. Javier Prado Este, San Isidro, Lima</p>
              <p>✉️ contacto@izinvoice.pe</p>
              <p>📞 +51 987 654 321</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-zinc-100 mt-10 pt-6 text-center text-[10px] text-zinc-400 font-medium">
          © {new Date().getFullYear()} izinvoice. Todos los derechos reservados. Desarrollado por <a href="https://www.minddev.pe" target="_blank" rel="noopener noreferrer" className="text-[#4f46e5] font-semibold hover:underline">MindDev</a>.
        </div>
      </footer>

      {/* DEMO REQUEST MODAL */}
      <AnimatePresence>
        {demoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              onClick={() => {
                setDemoModalOpen(false);
                setDemoFormSubmitted(false);
              }}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-[460px] bg-white rounded-2xl shadow-2xl relative z-10 border border-zinc-200 p-6 space-y-5"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-zinc-900">Solicitar Demo Personalizada</h3>
                  <p className="text-xs text-zinc-500 font-medium">Déjanos tus datos y un especialista te contactará en breve.</p>
                </div>
                <button 
                  onClick={() => {
                    setDemoModalOpen(false);
                    setDemoFormSubmitted(false);
                  }}
                  className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {!demoFormSubmitted ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDemoFormSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5 tracking-wider">Nombre Completo</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ej. Juan Pérez" 
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5 tracking-wider">Celular / WhatsApp</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ej. 987654321" 
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5 tracking-wider">Correo Electrónico</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="Ej. juan@empresa.com" 
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5 tracking-wider">RUC o Nombre de Empresa</label>
                    <input 
                      type="text" 
                      placeholder="Ej. 20123456789 o Mi Empresa S.A.C." 
                      className="w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Enviar Solicitud <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-zinc-900 text-sm">¡Solicitud Recibida!</h4>
                    <p className="text-xs text-zinc-500 font-medium">Un asesor comercial de izinvoice se comunicará contigo vía WhatsApp en los próximos minutos.</p>
                  </div>
                  <button
                    onClick={() => {
                      setDemoModalOpen(false);
                      setDemoFormSubmitted(false);
                    }}
                    className="px-6 py-2.5 border border-zinc-200 rounded-xl font-bold text-xs text-zinc-700 hover:bg-zinc-50"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION DOCK */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 50, scale: 0.95, x: '-50%' }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-6 left-1/2 z-50 bg-white/90 backdrop-blur-md border border-zinc-200/80 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-6 max-w-[90%] md:max-w-md"
          >
            <div className="hidden sm:flex items-center border-r border-zinc-150 pr-4">
              <div className="bg-[#4f46e5]/5 px-2 py-1 rounded-md flex items-center justify-center">
                <img src="/log.png" alt="Logo" className="h-5 w-auto object-contain" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                Prueba Gratis
              </Link>
              <button 
                onClick={() => setDemoModalOpen(true)}
                className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 rounded-xl font-bold text-xs active:scale-[0.98] transition-all whitespace-nowrap"
              >
                Solicitar Demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
