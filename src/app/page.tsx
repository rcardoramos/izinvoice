'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, Terminal, AlertCircle, Building2, UserCheck, 
  Check, ChevronDown, MessageSquare, Zap, BarChart3, Globe, Cloud, 
  Lock, Smartphone, LayoutDashboard, ShoppingBag, Users, Package, 
  ShoppingCart, Landmark, Settings, ClipboardList, RefreshCw, Star,
  Menu, X, HelpCircle, Building
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoFormSubmitted, setDemoFormSubmitted] = useState(false);

  // FAQ Data
  const faqs = [
    {
      q: "¿Cómo empiezo?",
      a: "El proceso es simple y rápido. Te registras en nuestra plataforma, configuras los datos de tu empresa, cargas tus productos o servicios, ¡y estarás listo para emitir tu primer comprobante en menos de 10 minutos!"
    },
    {
      q: "¿Se conecta con SUNAT?",
      a: "Sí, izinvoce está 100% homologado y conectado directamente con SUNAT a través de nuestro OSE/PSE autorizado. Todos tus comprobantes se envían y validan de forma oficial en tiempo real."
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
      content: "Migrar a izinvoce fue la mejor decisión para nuestro negocio. Emitimos más de 500 boletas diarias desde la caja POS sin ninguna lentitud, y el soporte por WhatsApp nos resolvió las dudas tributarias de inmediato.",
      rating: 5,
      avatar: "AM"
    },
    {
      name: "Sofia Valdivia",
      role: "Fundadora",
      company: "Aura Boutique & Diseños",
      content: "Buscaba un sistema limpio, rápido y con estilo. La mayoría de sistemas de facturación en Perú se ven antiguos, pero izinvoce tiene ese diseño premium tipo Apple que da gusto usar todos los días. ¡Me encanta!",
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

  return (
    <div className="bg-[#f8fafc] text-zinc-900 font-sans min-h-screen relative overflow-hidden antialiased">
      {/* Background radial effects */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* STICKY NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-zinc-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 text-xs">
              IZ
            </div>
            <span className="font-extrabold tracking-tight text-zinc-900 text-lg uppercase">izinvoce</span>
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

      {/* HERO SECTION */}
      <section id="inicio" className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid md:grid-cols-12 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-6 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/15">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-bold text-indigo-700 tracking-wide uppercase">Conectado con SUNAT PSE/OSE</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-[1.1]">
            EL SISTEMA DE FACTURACIÓN ELECTRÓNICA QUE TU EMPRESA NECESITA
          </h1>

          <p className="text-sm md:text-base text-zinc-500 font-medium leading-relaxed">
            Emite Facturas, Boletas, Notas de Crédito, Guías de Remisión y controla tu negocio desde una sola plataforma moderna y conectada con SUNAT.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href="/login" 
              className="px-6 py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-2 active:scale-[0.98]"
            >
              Prueba Gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <button 
              onClick={() => setDemoModalOpen(true)}
              className="px-6 py-3.5 border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 rounded-xl font-bold text-xs transition-all active:scale-[0.98]"
            >
              Solicitar Demo
            </button>
          </div>
        </motion.div>

        {/* HERO RIGHT: Premium Interactive Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="md:col-span-6"
        >
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden relative group">
            {/* Window bar */}
            <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400/80 block" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/80 block" />
                <span className="w-3 h-3 rounded-full bg-green-400/80 block" />
              </div>
              <div className="text-[10px] font-semibold text-zinc-400 bg-zinc-200/50 px-3 py-1 rounded-md">
                app.izinvoce.pe/dashboard
              </div>
              <div className="w-6" />
            </div>

            {/* Dashboard Workspace */}
            <div className="p-5 bg-zinc-50/50 space-y-5">
              {/* Top info and SUNAT Badge */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Dashboard Principal</h3>
                  <p className="text-sm font-bold text-zinc-800">Mi Empresa S.A.C.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide">SUNAT: Conectado</span>
                </div>
              </div>

              {/* Grid indicators */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3.5 border border-zinc-200/75 rounded-xl space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Ventas del Día</span>
                  <p className="text-base font-extrabold text-[#4f46e5]">S/ 12,450</p>
                  <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5">
                    ▲ +15.4%
                  </span>
                </div>
                <div className="bg-white p-3.5 border border-zinc-200/75 rounded-xl space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Emitidos Hoy</span>
                  <p className="text-base font-extrabold text-zinc-800">142 docs</p>
                  <span className="text-[9px] font-bold text-indigo-500">100% Correcto</span>
                </div>
                <div className="bg-white p-3.5 border border-zinc-200/75 rounded-xl space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Clientes</span>
                  <p className="text-base font-extrabold text-zinc-800">84 activos</p>
                  <span className="text-[9px] font-bold text-emerald-500">2 nuevos hoy</span>
                </div>
              </div>

              {/* Graphic/Table Simulator */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Últimos Comprobantes</span>
                  <span className="text-[9px] text-[#4f46e5] font-bold hover:underline cursor-pointer">Ver todos</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs border-b border-zinc-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded text-[9px]">F001-492</span>
                      <span className="font-semibold text-zinc-700">Corporación Andina S.A.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-zinc-900">S/ 4,500.00</span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">Aceptado</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs border-b border-zinc-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded text-[9px]">B001-8302</span>
                      <span className="font-semibold text-zinc-700">Juan Pérez Quispe</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-zinc-900">S/ 120.00</span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">Aceptado</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded text-[9px]">G001-182</span>
                      <span className="font-semibold text-zinc-700">Transportes del Sur EIRL</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-zinc-400">Guía Remisión</span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">Aceptado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="beneficios" className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-100">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] font-bold text-[#4f46e5] bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Ventajas Competitivas
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Factura más rápido. Controla más. Crece mejor.
          </h2>
          <p className="text-zinc-500 font-medium text-sm">
            Diseñado para eliminar la fricción en tu facturación diaria y ayudarte a cumplir con SUNAT sin complicaciones.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: "Emisión Rápida", 
              desc: "Genera comprobantes de pago en segundos con autocompletado inteligente de clientes y productos.", 
              icon: <Zap className="w-5 h-5 text-indigo-600" />,
              bg: "bg-indigo-50/50",
              border: "border-indigo-100",
              tag: "Ahorro de Tiempo"
            },
            { 
              title: "Reportes Inteligentes", 
              desc: "Visualiza tus ventas, impuestos y cuentas por cobrar en tiempo real con gráficos vivos y exportables.", 
              icon: <BarChart3 className="w-5 h-5 text-emerald-600" />,
              bg: "bg-emerald-50/50",
              border: "border-emerald-100",
              tag: "Analítica en Vivo"
            },
            { 
              title: "Multiempresa Integrado", 
              desc: "Gestiona múltiples negocios y RUCs desde un mismo perfil centralizado, cambiando de cuenta con un solo clic.", 
              icon: <Building className="w-5 h-5 text-amber-600" />,
              bg: "bg-amber-50/55",
              border: "border-amber-100",
              tag: "Control Total"
            },
            { 
              title: "Web + Móvil Adaptable", 
              desc: "Accede de forma segura desde smartphones, tablets, laptops o PCs sin instalar programas complejos.", 
              icon: <Smartphone className="w-5 h-5 text-purple-600" />,
              bg: "bg-purple-50/50",
              border: "border-purple-100",
              tag: "Diseño Responsivo"
            },
            { 
              title: "En la Nube 24/7", 
              desc: "Tu información siempre disponible y respaldada automáticamente en servidores redundantes de alta velocidad.", 
              icon: <Cloud className="w-5 h-5 text-sky-600" />,
              bg: "bg-sky-50/50",
              border: "border-sky-100",
              tag: "Disponibilidad Garantizada"
            },
            { 
              title: "Seguridad Corporativa", 
              desc: "Tus datos financieros y comerciales encriptados bajo protocolos SSL y respaldados con los más altos estándares.", 
              icon: <Lock className="w-5 h-5 text-rose-600" />,
              bg: "bg-rose-50/50",
              border: "border-rose-100",
              tag: "Cifrado Militar"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8, scale: 1.01, borderColor: "#4f46e5/30", boxShadow: "0 20px 40px -15px rgba(79, 70, 229, 0.05)" }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white border border-zinc-200 p-8 rounded-3xl transition-colors duration-150 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <span className="text-[9px] font-bold text-zinc-400 group-hover:text-[#4f46e5] border border-zinc-250/30 px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors duration-250">
                    {item.tag}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-zinc-900 text-sm tracking-tight group-hover:text-[#4f46e5] transition-colors duration-250">
                    {item.title}
                  </h3>
                  <p className="text-zinc-500 font-medium text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* SECCIÓN MÓDULOS (GRID PREMIUM) */}
      <section id="funciones" className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-100">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Módulos adicionales a tu medida
          </h2>
          <p className="text-zinc-500 font-medium text-sm">
            Personaliza tu experiencia agregando funciones avanzadas de forma modular. Adquiere solo lo que tu negocio necesita con una pequeña inversión adicional.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Dashboard", desc: "Panel general de ventas y estado SUNAT.", icon: <LayoutDashboard className="w-5 h-5" />, tag: "Esencial", tagColor: "bg-indigo-50 text-indigo-700 border-indigo-100/60" },
            { name: "Ventas", desc: "Facturas, boletas y cotizaciones rápidas.", icon: <ShoppingCart className="w-5 h-5" />, tag: "Esencial", tagColor: "bg-indigo-50 text-indigo-700 border-indigo-100/60" },
            { name: "Clientes", desc: "Directorio inteligente con búsqueda RUC.", icon: <Users className="w-5 h-5" />, tag: "Básico", tagColor: "bg-zinc-100/80 text-zinc-600 border-zinc-200" },
            { name: "Productos", desc: "Gestión de catálogo, categorías y precios.", icon: <Package className="w-5 h-5" />, tag: "Básico", tagColor: "bg-zinc-100/80 text-zinc-600 border-zinc-200" },
            { name: "Inventario", desc: "Control de stock e ingresos/salidas (Kárdex).", icon: <ClipboardList className="w-5 h-5" />, tag: "Adicional", tagColor: "bg-amber-50 text-amber-700 border-amber-100/60" },
            { name: "Libro de Reclamaciones", desc: "Cumple con las normas vigentes de forma 100% digital.", icon: <MessageSquare className="w-5 h-5" />, tag: "Normativo", tagColor: "bg-emerald-50 text-emerald-700 border-emerald-100/60" },
            { name: "Compras", desc: "Registro de proveedores y gastos mensuales.", icon: <Landmark className="w-5 h-5" />, tag: "Adicional", tagColor: "bg-amber-50 text-amber-700 border-amber-100/60" },
            { name: "Finanzas", desc: "Cuentas por cobrar y control de caja chica.", icon: <RefreshCw className="w-5 h-5" />, tag: "Avanzado", tagColor: "bg-purple-50 text-purple-700 border-purple-100/60" },
            { name: "Reportes", desc: "Descarga de reportes en Excel y PDF.", icon: <BarChart3 className="w-5 h-5" />, tag: "Adicional", tagColor: "bg-amber-50 text-amber-700 border-amber-100/60" },
            { name: "Usuarios", desc: "Roles y permisos del personal (Cajeros, Admin).", icon: <UserCheck className="w-5 h-5" />, tag: "Seguridad", tagColor: "bg-sky-50 text-sky-700 border-sky-100/60" },
            { name: "Sucursales", desc: "Gestión de múltiples almacenes y tiendas.", icon: <Building2 className="w-5 h-5" />, tag: "Multi-sede", tagColor: "bg-blue-50 text-blue-700 border-blue-100/60" },
            { name: "SUNAT", desc: "Historial de CDRs, XMLs y estados oficiales.", icon: <ShieldCheck className="w-5 h-5" />, tag: "Conectores", tagColor: "bg-teal-50 text-teal-700 border-teal-100/60" }
          ].map((mod, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white border border-zinc-200/80 p-5 rounded-2xl transition-colors duration-150 cursor-default flex flex-col justify-between hover:border-[#4f46e5]/40 hover:shadow-xl hover:shadow-indigo-500/5 group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-500 group-hover:bg-indigo-50 group-hover:text-[#4f46e5] group-hover:border-indigo-100 transition-colors">
                  {mod.icon}
                </div>
                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${mod.tagColor}`}>
                  {mod.tag}
                </span>
              </div>
              <div className="space-y-1 mt-6">
                <h3 className="font-extrabold text-zinc-800 text-xs tracking-tight group-hover:text-[#4f46e5] transition-colors">{mod.name}</h3>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">{mod.desc}</p>
              </div>
            </motion.div>
          ))}
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

      {/* SECCIÓN FUNCIONALIDADES */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-100 bg-[#f8fafc]">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
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
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: "Facturación Electrónica", 
              desc: "Emisión de Boletas de Venta, Facturas, Notas de Crédito, Notas de Débito y Guías de Remisión en segundos, con firma digital e integradas de forma automática.",
              icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
              bg: "bg-emerald-50/55",
              border: "border-emerald-100",
              tag: "Homologado por SUNAT",
              subtag: "Firma Digital"
            },
            { 
              title: "Inventario Inteligente", 
              desc: "Seguimiento en tiempo real de entradas, salidas y existencias mínimas. Kárdex valorizado para auditoría y valorización automática de tu almacén.",
              icon: <Package className="w-5 h-5 text-indigo-600" />,
              bg: "bg-indigo-50/55",
              border: "border-indigo-100",
              tag: "Kárdex Oficial",
              subtag: "Alertas de Stock"
            },
            { 
              title: "Compras y Gastos", 
              desc: "Registro integral de facturas de proveedores para controlar tu stock entrante, tus cuentas por pagar y el cálculo correcto de tu IGV mensual.",
              icon: <ShoppingCart className="w-5 h-5 text-amber-600" />,
              bg: "bg-amber-50/55",
              border: "border-amber-100",
              tag: "Crédito Fiscal",
              subtag: "Cuentas por Pagar"
            },
            { 
              title: "Punto de Venta POS", 
              desc: "Terminal optimizada para el cobro rápido. Compatible con lectores de código de barras, cajones monederos e impresoras de tickets térmicas.",
              icon: <ShoppingBag className="w-5 h-5 text-purple-600" />,
              bg: "bg-purple-50/55",
              border: "border-purple-100",
              tag: "Caja y Turnos",
              subtag: "Boleta Rápida"
            },
            { 
              title: "Reportes Gerenciales", 
              desc: "Visualiza de forma gráfica el comportamiento de tu negocio. Exporta listas tributarias listas para el envío de tus libros contables.",
              icon: <BarChart3 className="w-5 h-5 text-rose-600" />,
              bg: "bg-rose-50/55",
              border: "border-rose-100",
              tag: "Exportable a Excel",
              subtag: "Gráficos Vivos"
            },
            { 
              title: "Multiempresa Centralizado", 
              desc: "Añade nuevos negocios o RUCs en minutos. Centraliza la visión global de todas tus razones sociales desde un mismo perfil administrativo.",
              icon: <Building2 className="w-5 h-5 text-blue-600" />,
              bg: "bg-blue-50/55",
              border: "border-blue-100",
              tag: "Múltiples RUCs",
              subtag: "Control Total"
            }
          ].map((func, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -8, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.06)", borderColor: "#4f46e5" }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white border border-zinc-200 p-8 rounded-3xl relative overflow-hidden transition-colors duration-150 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className={`w-12 h-12 rounded-2xl ${func.bg} border ${func.border} flex items-center justify-center`}>
                  {func.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-zinc-900 text-sm tracking-tight">{func.title}</h3>
                  <p className="text-zinc-500 font-medium text-xs leading-relaxed">{func.desc}</p>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center gap-1.5 text-[#4f46e5] text-[10px] font-bold uppercase tracking-wider">
                <span>{func.tag}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                <span className="text-zinc-400">{func.subtag}</span>
              </div>
            </motion.div>
          ))}
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

      {/* SECCIÓN KPIs */}
      <section className="bg-[#4f46e5] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-extrabold tracking-tight">+10,000</p>
            <p className="text-[10px] md:text-xs font-semibold text-indigo-100 uppercase tracking-wider">Comprobantes emitidos diariamente</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-extrabold tracking-tight">99.9%</p>
            <p className="text-[10px] md:text-xs font-semibold text-indigo-100 uppercase tracking-wider">Disponibilidad del Sistema</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-extrabold tracking-tight">24/7</p>
            <p className="text-[10px] md:text-xs font-semibold text-indigo-100 uppercase tracking-wider">Acceso desde cualquier lugar</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-extrabold tracking-tight">100%</p>
            <p className="text-[10px] md:text-xs font-semibold text-indigo-100 uppercase tracking-wider">Conectado con SUNAT</p>
          </div>
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
            Empresas que ya confían en izinvoce
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
                ¿Tienes alguna duda sobre el funcionamiento de la facturación electrónica o sobre cómo izinvoce se integra con SUNAT? Aquí tienes las respuestas.
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
              Únete a las empresas que ya simplifican sus procesos contables y administrativos con izinvoce.
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
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center font-bold text-white shadow-md text-xs">
                IZ
              </div>
              <span className="font-extrabold tracking-tight text-zinc-900 text-base uppercase">izinvoce</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
              Facturación electrónica moderna para empresas peruanas. Autorizado por SUNAT. Un producto de <a href="https://www.minddev.pe" target="_blank" rel="noopener noreferrer" className="text-[#4f46e5] font-semibold hover:underline">MindDev</a>.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Enlaces</h4>
            <div className="flex flex-col gap-2 text-xs font-semibold text-zinc-500">
              <a href="#inicio" className="hover:text-zinc-900 transition-colors">Inicio</a>
              <a href="#funciones" className="hover:text-zinc-900 transition-colors">Funciones</a>
              <a href="#planes" className="hover:text-zinc-900 transition-colors">Planes</a>
              <a href="#contacto" className="hover:text-zinc-900 transition-colors">Contacto</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Soporte y Legal</h4>
            <div className="flex flex-col gap-2 text-xs font-semibold text-zinc-500">
              <a href="#" className="hover:text-zinc-900 transition-colors">Términos del Servicio</a>
              <a href="#" className="hover:text-zinc-900 transition-colors">Políticas de Privacidad</a>
              <a href="#" className="hover:text-zinc-900 transition-colors">Libro de Reclamaciones</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Contacto</h4>
            <div className="text-xs text-zinc-500 font-semibold space-y-1">
              <p>📍 Av. Javier Prado Este, San Isidro, Lima</p>
              <p>✉️ contacto@izinvoce.pe</p>
              <p>📞 +51 987 654 321</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-zinc-100 mt-10 pt-6 text-center text-[10px] text-zinc-400 font-medium">
          © {new Date().getFullYear()} izinvoce. Todos los derechos reservados. Desarrollado por <a href="https://www.minddev.pe" target="_blank" rel="noopener noreferrer" className="text-[#4f46e5] font-semibold hover:underline">MindDev</a>.
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
                    <p className="text-xs text-zinc-500 font-medium">Un asesor comercial de izinvoce se comunicará contigo vía WhatsApp en los próximos minutos.</p>
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
    </div>
  );
}
