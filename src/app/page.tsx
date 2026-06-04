'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, Terminal, AlertCircle, Building2, UserCheck, 
  Check, ChevronDown, MessageSquare, Zap, BarChart3, Globe, Cloud, 
  Lock, Smartphone, LayoutDashboard, ShoppingBag, Users, Package, 
  ShoppingCart, Landmark, Settings, ClipboardList, RefreshCw, Star,
  Menu, X, HelpCircle, Building, Bell, QrCode, FileText
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoModalContext, setDemoModalContext] = useState("solicitar_demo");
  const [demoFormSubmitted, setDemoFormSubmitted] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeBusiness, setActiveBusiness] = useState<number>(0);
  const [expandedTestimonials, setExpandedTestimonials] = useState(false);

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
      q: "¿Puedo administrar varias sucursales?",
      a: "Sí. Nuestro sistema está diseñado para que gestiones todas las sucursales de tu empresa desde una misma cuenta. Podrás administrar cajas, usuarios y reportes por cada local sin problemas."
    },
    {
      q: "¿Funciona desde celular?",
      a: "Sí. La plataforma es totalmente web responsiva, optimizada para funcionar de manera excelente en smartphones, tablets, laptops y computadoras de escritorio, sin necesidad de instalar apps pesadas."
    },
    {
      q: "¿Puedo personalizar mis comprobantes?",
      a: "Sí, puedes cargar el logotipo de tu empresa para que aparezca en todos tus comprobantes. El resto del diseño sigue un estándar profesional cuidadosamente definido por izinvoice, garantizando una presentación limpia, moderna y de alta credibilidad para tus clientes en cada documento emitido."
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
      content: "La gestión de cotizaciones combinada con la facturación y guías de remisión en la nube nos permite tener 3 sucursales sincronizadas en tiempo real. Un sistema robusto y sumamente profesional.",
      rating: 5,
      avatar: "CR"
    }
  ];

  // Businesses (Para quién es)
  const businesses = [
    { name: "Minimarkets", icon: "🏪", desc: "Ventas rápidas con lector de código de barras y caja chica." },
    { name: "Tiendas", icon: "👗", desc: "Emisión de boletas rápidas y control de turnos en tiempo real." },
    { name: "Restaurantes", icon: "🍔", desc: "Comandas rápidas, división de cuentas y control de insumos." },
    { name: "Ferreterías", icon: "🔧", desc: "Gestión de múltiples unidades de medida (caja, docena, unidad)." },
    { name: "Farmacias", icon: "💊", desc: "Control de fechas de vencimiento y lotes de medicamentos." },
    { name: "Veterinarias", icon: "🐶", desc: "Historial de mascotas asociado a la facturación de servicios." },
    { name: "Peluquerías", icon: "✂️", desc: "Control de comisiones por estilista y reserva de turnos." },
    { name: "Librerías", icon: "📚", desc: "Catálogos amplios de productos y útiles de oficina." },
    { name: "Tecnología", icon: "💻", desc: "Control de números de serie y garantías de equipos." },
    { name: "Licorerías", icon: "🍾", desc: "Cuadre de caja por turnos y facturación rápida de productos." },
    { name: "Grifos", icon: "⛽", desc: "Facturación rápida en playa conectada con surtidores." },
    { name: "Emprendimientos", icon: "🚀", desc: "Comienza formal, emitiendo comprobantes de manera súper fácil." },
    { name: "Emprendedores", icon: "✨", desc: "Formaliza tu negocio desde el primer día. Emite boletas y facturas electrónicas de forma simple, rápida y sin complicaciones tributarias.", featured: true },
    { name: "Distribuidoras", icon: "🚛", desc: "Guías de remisión y control de rutas de reparto en tiempo real." },
    { name: "Consultoras", icon: "🤝", desc: "Cotizaciones y facturas de servicios profesionales en segundos." },
    { name: "Hoteles", icon: "🏨", desc: "Facturación por estancia, extras y servicios adicionales." },
    { name: "Educación", icon: "🎓", desc: "Cobro de mensualidades, matrículas y emisión de recibos." },
    { name: "Talleres", icon: "⚙️", desc: "Órdenes de trabajo, repuestos y mano de obra integrados." },
    { name: "Joyerías", icon: "💎", desc: "Control de piezas únicas, gramajes y precios variables." },
    { name: "Gym & Fitness", icon: "🏋️", desc: "Membresías recurrentes y venta de suplementos en un solo sistema." },
    { name: "Supermercados", icon: "🛒", desc: "Múltiples cajas sincronizadas y control de vencimiento masivo." },
    { name: "Agencias de Viaje", icon: "✈️", desc: "Facturación de paquetes, pasajes y servicios turísticos." },
    { name: "Constructoras", icon: "🏗️", desc: "Facturas por avance de obra y control de proyectos." },
    { name: "Clínicas", icon: "🏥", desc: "Cobro por consultas, procedimientos y medicamentos con historia clínica." },
    { name: "Panaderías", icon: "🥐", desc: "Producción diaria, mermas y ventas al mostrador con POS integrado." },

    // Confianza y compliance SUNAT
    // { name: "Homologado SUNAT ✅", icon: "🛡️", desc: "Conexión PSE/OSE directa certificada y autorizada para envío inmediato de comprobantes." },
    // { name: "Firma Digital XML", icon: "📁", desc: "Firma automática del XML oficial garantizando la validez tributaria y legal." },
    // { name: "Emisión en < 2 seg", icon: "⚡", desc: "Envío y validación en SUNAT en milisegundos gracias a servidores optimizados en la nube." },
    // { name: "Libros SIRE / PLE", icon: "📊", desc: "Generación automática y descarga en un clic del registro de compras y ventas." },
    // { name: "Respaldos AWS 🔒", icon: "💾", desc: "Copias de seguridad diarias automatizadas en la nube de Amazon Web Services." },
    // { name: "Acceso Multidispositivo", icon: "📲", desc: "Monitorea y emite desde cualquier celular, tablet o laptop sin límites." },
    // { name: "Control Multisede", icon: "🏢", desc: "Administra múltiples locales, almacenes y cajas desde un único perfil." },
    // { name: "Factura Electrónica", icon: "🧾", desc: "Emite facturas, boletas, notas de crédito y débito con 100% validez legal." },
    // { name: "Boletas Electrónicas", icon: "🗒️", desc: "Boletas de venta con representación impresa en 80mm, A5 o A4." },
    // { name: "CDR en Tiempo Real", icon: "📨", desc: "Constancia de recepción de SUNAT automática al instante de la emisión." },
    // { name: "Modo Contingencia", icon: "🔁", desc: "Emite offline y sincroniza automáticamente al reconectarte a internet." },
    // { name: "API REST Abierta", icon: "🔌", desc: "Integra tu tienda online, ERP o app propia con nuestra API documentada." },
    // { name: "WhatsApp Automático", icon: "💬", desc: "Envía comprobantes al cliente por WhatsApp con un solo clic." },
    // { name: "Soporte 24/7", icon: "🎧", desc: "Equipo de soporte en WhatsApp y correo siempre disponible para ti." },
    // { name: "Guías de Remisión", icon: "📦", desc: "Genera guías de remisión SUNAT vinculadas a tus facturas de venta." },
    // { name: "Multi-Moneda", icon: "💱", desc: "Factura en soles o dólares con tipo de cambio automático al día." },
    // { name: "Retenciones & Detracciones", icon: "📋", desc: "Cálculo automático de retenciones y detracciones por sector." },
  ];

  const row1Modules = [
    { name: "Dashboard", desc: "Panel general de ventas y estado SUNAT.", icon: <LayoutDashboard className="w-5 h-5" />, tag: "Esencial", highlight: true },
    { name: "Clientes", desc: "Directorio inteligente con búsqueda RUC.", icon: <Users className="w-5 h-5" />, tag: "Básico", highlight: false },
    { name: "Cotizaciones", desc: "Genera proformas y conviértelas en facturas.", icon: <ClipboardList className="w-5 h-5" />, tag: "Adicional", highlight: false },
    { name: "Compras", desc: "Registro de proveedores y gastos mensuales.", icon: <Landmark className="w-5 h-5" />, tag: "Adicional", highlight: false },
    { name: "Reportes", desc: "Descarga de reportes en Excel y PDF.", icon: <BarChart3 className="w-5 h-5" />, tag: "Adicional", highlight: false },
    { name: "Sucursales", desc: "Gestión de múltiples puntos de venta y cajas.", icon: <Building2 className="w-5 h-5" />, tag: "Multi-sede", highlight: true }
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

      {/* FLOATING NAVBAR */}
      <header className="fixed top-4 left-4 right-4 z-50 transition-all max-w-6xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-[24px] shadow-xl shadow-indigo-900/5 border border-zinc-200/50 overflow-hidden flex flex-col">
          
          {/* Main Navbar */}
          <div className="px-5 md:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <a href="#inicio" className="flex items-center gap-3 cursor-pointer group">
              <div className="bg-[#4f46e5] p-2 rounded-[10px] flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <img src="/log.png" alt="Logo" className="h-5 w-auto object-contain brightness-0 invert" />
              </div>
            </a>

            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-zinc-600">
              <a href="#inicio" className="hover:text-[#4f46e5] transition-colors">Inicio</a>
              <a href="#funciones" className="hover:text-[#4f46e5] transition-colors flex items-center gap-1">
                Funciones <ChevronDown className="w-3 h-3 text-zinc-400" />
              </a>
              <a href="#planes" className="hover:text-[#4f46e5] transition-colors">Planes</a>
              <a href="#faq" className="hover:text-[#4f46e5] transition-colors">Acerca de</a>
              <a href="#contacto" className="hover:text-[#4f46e5] transition-colors">Contacto</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
                title="Ingresar a mi cuenta"
              >
                <UserCheck className="w-4 h-4" />
              </Link>
              
              <button 
                onClick={() => { setDemoModalContext("solicitar_demo"); setDemoModalOpen(true); }}
                className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-full font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Solicitar Demo
              </button>

              {/* Mobile menu trigger */}
              <button 
                className="lg:hidden w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="lg:hidden mt-2 bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-[20px] p-6 shadow-xl"
            >
              <div className="flex flex-col gap-4 text-sm font-bold text-zinc-700">
                <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#4f46e5]">Inicio</a>
                <a href="#funciones" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#4f46e5]">Funciones</a>
                <a href="#planes" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#4f46e5]">Planes</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#4f46e5]">Acerca de</a>
                <a href="#contacto" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#4f46e5]">Contacto</a>
              </div>
              <div className="flex flex-col gap-3 pt-4 border-t border-zinc-100 mt-4">
                <Link 
                  href="/login"
                  className="w-full text-center py-3 border-2 border-zinc-100 rounded-xl font-bold text-xs text-zinc-700 bg-zinc-50 hover:bg-zinc-100"
                >
                  Ingresar a mi cuenta
                </Link>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setDemoModalContext("solicitar_demo");
                    setDemoModalOpen(true);
                  }}
                  className="w-full text-center py-3 bg-[#4f46e5] text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/10"
                >
                  Solicitar Demo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION (CENTRE GRADIENT CARD - ESTILO RAMPAY) */}
      <section id="inicio" className="max-w-7xl mx-auto px-4 pt-[85px] relative">
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
              Emite comprobantes en segundos, automatiza tus cobranzas y gestiona tu negocio en tiempo real. Un sistema tan simple e intuitivo que cualquier persona de tu equipo aprenderá a usarlo en minutos.
            </p>

            {/* Centered CTA Action */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">

              <button
                onClick={() => { setDemoModalContext("solicitar_demo"); setDemoModalOpen(true); }}
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
                    <span className="text-zinc-500 font-semibold flex items-center gap-1">🔴 Gasto Marketing</span>
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

              {/* Card 3: Right - Cotizaciones */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xl w-[250px] h-[190px] flex flex-col justify-between shrink-0 text-left"
              >
                <div>
                  <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider block">Proformas Rápidas</span>
                  <h4 className="font-extrabold text-xs text-zinc-800 tracking-tight mt-0.5">Gestión Comercial</h4>
                </div>
                
                <div className="space-y-3 pt-2 border-t border-zinc-50">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-zinc-500">
                      <span>Cotización #0045</span>
                      <span className="text-emerald-600 font-bold">Aprobada</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[100%] rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-zinc-500">
                      <span>Cotización #0046</span>
                      <span className="text-amber-600 font-bold">Pendiente</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[50%] rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg mt-1 text-[8px] text-emerald-700 font-bold">
                  ✅ ALERTA: Cotización #0045 aceptada
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
              Únete a miles de empresas peruanas que ya simplifican sus procesos de emisión de comprobantes, reportes y caja chica con izinvoice.
            </p>
          </div>
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
                  title: "Cotizaciones y Proformas",
                  desc: "Crea cotizaciones profesionales y conviértelas en comprobantes electrónicos con un solo clic, sin doble digitación.",
                  icon: <FileText className="w-4 h-4 text-emerald-600" />,
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
                      <strong>Nueva Venta:</strong> Ingreso por <span className="text-emerald-700 font-bold">S/ 4,500.00</span> procesado con éxito.
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
        <div className="mt-10 relative overflow-hidden rounded-[32px] border border-zinc-200/60 shadow-xl bg-[#0d0b1f]">
          
          {/* Background illustration */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: "url('/minddev_banner.png')" }}
          />
          {/* Overlay gradient left to right for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b1f] via-[#0d0b1f]/90 to-[#0d0b1f]/30" />

          {/* Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-10">
            
            {/* LEFT: Logo + Text */}
            <div className="flex-1 space-y-5 text-center md:text-left">
              {/* MindDev Logo + Badge row */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-sm inline-flex">
                  <img src="/logo-minddev.png" alt="MindDev" className="h-6 w-auto object-contain brightness-0 invert" />
                </div>
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                  Empresa Hermana de izinvoice
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
                  ¿Necesitas una Web, Tienda Online<br className="hidden md:block" />
                  <span className="text-indigo-300"> o Sistema a Medida?</span>
                </h3>
                <p className="text-zinc-400 font-medium text-xs md:text-sm leading-relaxed max-w-xl">
                  Nuestro aliado estratégico, <span className="text-indigo-300 font-bold">MindDev</span>, diseña y desarrolla páginas web corporativas, tiendas virtuales (e-commerce) con carrito de compras y sistemas empresariales integrados a la medida de tu negocio.
                </p>
              </div>

              {/* Service pills */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {[
                  { icon: "🌐", label: "Páginas Web Corporativas" },
                  { icon: "🛒", label: "E-commerce & Carrito" },
                  { icon: "⚙️", label: "Sistemas a Medida" },
                  { icon: "📱", label: "Apps Móviles" },
                ].map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-zinc-300 text-[10px] font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm"
                  >
                    <span className="text-sm">{s.icon}</span>
                    {s.label}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-3 pt-1 justify-center md:justify-start">
                <a
                  href="https://www.minddev.pe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white hover:bg-zinc-100 text-[#0d0b1f] rounded-full font-extrabold text-xs shadow-xl shadow-black/30 active:scale-[0.98] transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  Visitar MindDev <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://wa.me/51903067489?text=Hola%2C%20necesito%20información%20sobre%20desarrollo%20web%20con%20MindDev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-full font-bold text-xs backdrop-blur-sm transition-all active:scale-[0.98] whitespace-nowrap"
                >
                  💬 Consultar por WhatsApp
                </a>
              </div>
            </div>

            {/* RIGHT: Decorative floating mockup cards (visible on md+) */}
            <div className="hidden md:flex shrink-0 relative w-[280px] h-[200px] items-center justify-center">
              {/* Card 1: E-commerce mock */}
              <div className="absolute left-0 top-4 w-[160px] bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm shadow-xl z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center">
                    <span className="text-[8px] text-white font-black">🛒</span>
                  </div>
                  <span className="text-[8px] text-white font-bold">Tienda Online</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {["Producto A","Producto B","Producto C","Producto D"].map((p,i)=>(
                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-1.5">
                      <div className="w-full h-8 bg-indigo-500/20 rounded-md mb-1" />
                      <p className="text-[6.5px] text-zinc-400 font-semibold truncate">{p}</p>
                      <p className="text-[7px] text-emerald-400 font-black">S/ {(i+1)*25}.00</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Custom system mock */}
              <div className="absolute right-0 bottom-4 w-[150px] bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm shadow-xl z-20">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-5 h-5 rounded-md bg-violet-500 flex items-center justify-center">
                    <span className="text-[8px] text-white font-black">⚙️</span>
                  </div>
                  <span className="text-[8px] text-white font-bold">Sistema ERP</span>
                </div>
                {[
                  { label: "Módulos activos", value: "12", color: "text-indigo-300" },
                  { label: "Usuarios conectados", value: "8", color: "text-emerald-400" },
                  { label: "API integrada", value: "✓", color: "text-amber-400" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-0.5 border-b border-white/5">
                    <span className="text-[7px] text-zinc-400 font-medium">{row.label}</span>
                    <span className={`text-[8px] font-black ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Center glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl" />
              </div>
            </div>

          </div>
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
                  Simplifica tu <span className="inline-block px-3 py-0.5 bg-[#4f46e5] text-white text-xs md:text-sm font-bold rounded-full uppercase tracking-wider mx-1">facturación</span> y controla tus <span className="inline-block px-3 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs md:text-sm font-bold rounded-full uppercase tracking-wider mx-1">cobranzas</span> en tiempo <span className="inline-block px-3 py-0.5 border border-zinc-300 text-zinc-600 text-xs md:text-sm font-bold rounded-full uppercase tracking-wider mx-1">real</span> con una plataforma ágil.
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
                { name: "Cotizaciones", icon: <FileText className="w-6 h-6 text-[#4f46e5]" />, label: "A Factura" },
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

      {/* SECCIÓN PARA QUIÉN ES (PILL CLOUD - ESTILO ONPROFIT) */}
      <section id="para-quien" className="max-w-7xl mx-auto px-4 mt-16 mb-8 md:mt-24 md:mb-12 relative">
        <div className="bg-white border border-zinc-200/80 rounded-[40px] shadow-2xl px-6 py-16 md:py-24 relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-bold text-[#4f46e5] bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Adaptabilidad SaaS
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
              Pensado para todo tipo de negocio
            </h2>
            <p className="text-zinc-500 font-medium text-xs md:text-sm">
              Nuestra flexibilidad nos permite adaptarnos a diferentes dinámicas de venta y control.
            </p>
          </div>

          {/* Pill Cloud Container */}
          <div className="flex flex-wrap justify-center gap-3.5 max-w-4xl mx-auto select-none">
            {businesses.map((bus, idx) => {
              const isActive = activeBusiness === idx;
              const isFeatured = (bus as { featured?: boolean }).featured;

              // Helper function to color code the pills like the reference images
              const getPillStyle = () => {
                if (isFeatured && isActive) {
                  return "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-yellow-950 border-yellow-300 shadow-xl shadow-amber-400/30 scale-[1.08]";
                }
                if (isFeatured) {
                  return "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-yellow-950 border-yellow-300 shadow-lg shadow-amber-300/30 hover:scale-[1.06] hover:shadow-amber-400/40 hover:shadow-xl";
                }
                if (isActive) {
                  return "bg-[#4f46e5] text-white border-transparent shadow-lg shadow-indigo-500/20 scale-[1.05]";
                }
                const styles = [
                  "bg-[#1e1b4b] text-white border-transparent",      // Dark Indigo
                  "bg-indigo-50 text-[#4f46e5] border-transparent",  // Light Indigo
                  "bg-white text-zinc-700 border-zinc-200 hover:border-indigo-400", // White with border
                  "bg-[#6366f1]/10 text-[#4f46e5] border-transparent", // Light Violet
                  "bg-emerald-50 text-emerald-800 border-transparent", // Light Emerald
                  "bg-[#818cf8] text-white border-transparent"        // Soft Indigo
                ];
                return styles[idx % styles.length] + " hover:scale-[1.03] hover:shadow-sm";
              };

              return (
                <motion.button
                  key={idx}
                  onMouseEnter={() => setActiveBusiness(idx)}
                  className={`rounded-full border font-bold flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                    isFeatured
                      ? "px-7 py-4 text-sm"
                      : "px-5 py-3.5 text-xs"
                  } ${getPillStyle()}`}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={`shrink-0 leading-none ${isFeatured ? "text-3xl" : "text-2xl"}`}>{bus.icon}</span>
                  <span className="tracking-tight">{bus.name}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Dynamic Detail Card */}
          <div className="max-w-xl mx-auto mt-12 bg-zinc-50 border border-zinc-200 rounded-[28px] p-6 text-center shadow-sm relative overflow-hidden min-h-[110px] flex flex-col justify-center items-center">
            {/* Decorative browser elements */}
            <div className="absolute top-3 left-6 flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-200 block" />
              <span className="w-2 h-2 rounded-full bg-zinc-200 block" />
              <span className="w-2 h-2 rounded-full bg-zinc-200 block" />
            </div>
            
            <div className="space-y-2 mt-1">
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl leading-none">{businesses[activeBusiness].icon}</span>
                <span className="text-sm font-black uppercase tracking-widest text-[#4f46e5]">
                  {businesses[activeBusiness].name}
                </span>
              </div>
              <p className="text-zinc-600 font-semibold text-xs md:text-sm leading-relaxed max-w-lg transition-all duration-300">
                {businesses[activeBusiness].desc}
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* SECCIÓN PLANES */}
      <section id="planes" className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        {/* Outer container with soft gray background */}
        <div className="bg-zinc-50 border border-zinc-200/70 rounded-[40px] px-6 py-14 md:py-16 shadow-sm">

          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <span className="text-[10px] font-bold text-[#4f46e5] bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Precios Transparentes
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Planes a la medida de tu crecimiento
            </h2>
            <p className="text-zinc-500 font-medium text-sm">
              Sin contratos obligatorios. Sencillo, transparente y sin cargos ocultos.
            </p>
          </div>

          {/* Cards grid — center card is taller via negative margin trick */}
          <div className="grid md:grid-cols-3 gap-5 items-end">

            {/* ── PLAN EMPRENDE ── */}
            <div className="bg-white border border-zinc-200 rounded-[28px] p-8 flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="space-y-5">
                {/* Icon + Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xl">
                    🚀
                  </div>
                  <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">Plan Emprende</span>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-zinc-900 tracking-tight">S/ 39</span>
                    <span className="text-sm text-zinc-400 font-medium">/ mes</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mt-2 leading-relaxed">
                    Perfecto para emprendedores y pequeños negocios que buscan formalizar y automatizar su facturación.
                  </p>
                </div>

                <div className="w-full h-px bg-zinc-100" />

                {/* Features */}
                <ul className="space-y-3">
                  {[
                    "Facturación electrónica ilimitada",
                    "1 usuario incluido",
                    "1 sucursal",
                    "Clientes ilimitados",
                    "Reportes esenciales de ventas",
                    "Soporte por tickets (24 horas)",
                    "Descuento en desarrollo web con Minddev",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-600 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => { setDemoModalContext("emprende"); setDemoModalOpen(true); }}
                className="w-full text-center mt-8 py-3.5 border-2 border-zinc-200 hover:border-[#4f46e5] hover:text-[#4f46e5] rounded-2xl font-extrabold text-xs text-zinc-700 bg-white transition-all duration-200 flex items-center justify-center gap-2 group-hover:border-[#4f46e5] group-hover:text-[#4f46e5]"
              >
                Comenzar Ahora <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ── PLAN EJECUTIVO (FEATURED — more prominent) ── */}
            <div className="bg-gradient-to-b from-[#4f46e5] via-[#4338ca] to-[#3730a3] rounded-[28px] p-8 flex flex-col justify-between shadow-2xl shadow-indigo-600/30 md:-my-6 relative border border-indigo-500/30">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                <Star className="w-3 h-3 fill-amber-900" /> Más Popular
              </div>

              <div className="space-y-5">
                {/* Icon + Name */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-xl">
                    ⭐
                  </div>
                  <span className="text-xs font-extrabold text-indigo-200 uppercase tracking-widest">Plan Ejecutivo</span>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white tracking-tight">S/ 69</span>
                    <span className="text-sm text-indigo-300 font-medium">/ mes</span>
                  </div>
                  <p className="text-xs text-indigo-200/80 font-medium mt-2 leading-relaxed">
                    Diseñado para empresas en crecimiento que necesitan mayor control y productividad.
                  </p>
                </div>

                <div className="w-full h-px bg-white/10" />

                {/* Features */}
                <ul className="space-y-3">
                  {[
                    "Facturación electrónica ilimitada",
                    "3 usuarios incluidos",
                    "3 sucursales",
                    "Ticketera digital gratuita",
                    "Cotizaciones ilimitadas",
                    "Gestión de Compras",
                    "Finanzas y Bancos",
                    "Soporte prioritario",
                    "Descuento en desarrollo de CRM con Minddev",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-indigo-100 font-medium">
                      <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => { setDemoModalContext("ejecutivo"); setDemoModalOpen(true); }}
                className="w-full text-center mt-8 py-3.5 bg-white hover:bg-zinc-50 text-[#4f46e5] rounded-2xl font-extrabold text-xs shadow-xl shadow-black/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                Comenzar Ahora <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <p className="text-center text-indigo-300/60 text-[9px] font-semibold mt-3">Sin tarjeta de crédito requerida</p>
            </div>

            {/* ── PLAN EMPRESARIAL ── */}
            <div className="bg-white border border-zinc-200 rounded-[28px] p-8 flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="space-y-5">
                {/* Icon + Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xl">
                    🏢
                  </div>
                  <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">Plan Empresarial</span>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-zinc-900 tracking-tight">S/ 99</span>
                    <span className="text-sm text-zinc-400 font-medium">/ mes</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mt-2 leading-relaxed">
                    La solución integral para organizaciones que requieren máxima escalabilidad y control operativo.
                  </p>
                </div>

                <div className="w-full h-px bg-zinc-100" />

                {/* Features */}
                <ul className="space-y-3">
                  {[
                    "Comprobantes ilimitados",
                    "Sucursales ilimitadas",
                    "Usuarios ilimitados",
                    "Integración con SIRE SUNAT",
                    "Cotizaciones ilimitadas",
                    "Reportes dinámicos e indicadores",
                    "Asesoría contable especializada",
                    "Soporte preferencial empresarial",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-600 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => { setDemoModalContext("empresarial"); setDemoModalOpen(true); }}
                className="w-full text-center mt-8 py-3.5 border-2 border-zinc-200 hover:border-[#4f46e5] hover:text-[#4f46e5] rounded-2xl font-extrabold text-xs text-zinc-700 bg-white transition-all duration-200 flex items-center justify-center gap-2 group-hover:border-[#4f46e5] group-hover:text-[#4f46e5]"
              >
                Comenzar Ahora <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Bottom note */}
          <p className="text-center text-zinc-400 text-[11px] font-medium mt-10">
            ¿Necesitas un plan personalizado? <a href="https://wa.me/51903067489" target="_blank" rel="noopener noreferrer" className="text-[#4f46e5] font-bold hover:underline">Contáctanos por WhatsApp</a>
          </p>
        </div>
      </section>

      {/* SECCIÓN TESTIMONIOS */}

      {/* SECCIÓN TESTIMONIOS */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-100 overflow-hidden">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Rating & Reviews
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight">
            Trusted by people
          </h2>
          <p className="text-zinc-500 font-medium text-sm pt-2">
            Nuestros clientes avalan la rapidez de nuestra interfaz y la tranquilidad tributaria que ofrecemos. Haz clic en las tarjetas para leer.
          </p>
        </div>

        {/* Interactive Card Stack */}
        <div 
          className="relative w-full h-[550px] md:h-[450px] flex items-center justify-center cursor-pointer max-w-5xl mx-auto mt-8 md:mt-16 group"
          onClick={() => setExpandedTestimonials(!expandedTestimonials)}
        >
          {testimonials.map((test, idx) => {
            // Assign custom styles based on index to match the reference colors
            const isDark = idx === 0;
            const isPurple = idx === 1;
            const isWhite = idx === 2;

            let baseColorClass = "";
            let textColorClass = "";
            let starColorClass = "";

            if (isDark) {
              baseColorClass = "bg-[#0f0e1a] border-[#ffffff10] shadow-xl shadow-black/20";
              textColorClass = "text-white/90";
              starColorClass = "fill-indigo-400 text-indigo-400";
            } else if (isPurple) {
              baseColorClass = "bg-[#7c3aed] border-purple-500 shadow-2xl shadow-purple-500/30";
              textColorClass = "text-white";
              starColorClass = "fill-white text-white";
            } else {
              baseColorClass = "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50";
              textColorClass = "text-zinc-600";
              starColorClass = "fill-[#7c3aed] text-[#7c3aed]";
            }

            // Transform logic for collapsed vs expanded state
            let transformClass = "";
            
            if (!expandedTestimonials) {
              // Collapsed Stack
              if (idx === 0) transformClass = "rotate-[-10deg] -translate-x-6 md:-translate-x-12 translate-y-6 md:translate-y-8 z-10 scale-95 group-hover:-translate-x-10";
              if (idx === 1) transformClass = "rotate-[-2deg] z-20 scale-100 group-hover:-translate-y-2";
              if (idx === 2) transformClass = "rotate-[8deg] translate-x-6 md:translate-x-12 -translate-y-4 md:-translate-y-6 z-30 scale-95 group-hover:translate-x-10";
            } else {
              // Expanded State
              if (idx === 0) transformClass = "rotate-[-6deg] -translate-y-[160px] md:-translate-y-0 md:-translate-x-[320px] lg:-translate-x-[360px] z-10 scale-100";
              if (idx === 1) transformClass = "rotate-[0deg] z-20 scale-105 md:-translate-y-8";
              if (idx === 2) transformClass = "rotate-[6deg] translate-y-[160px] md:translate-y-0 md:translate-x-[320px] lg:translate-x-[360px] z-30 scale-100";
            }

            return (
              <div 
                key={idx} 
                className={`absolute w-[280px] md:w-[320px] p-8 rounded-[24px] border transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) flex flex-col justify-between min-h-[260px] md:min-h-[280px] ${baseColorClass} ${transformClass}`}
              >
                <div className="space-y-4">
                  <div className="flex gap-1.5">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 md:w-5 md:h-5 ${starColorClass}`} />
                    ))}
                  </div>
                  <p className={`font-medium text-xs md:text-sm leading-relaxed ${textColorClass}`}>
                    "{test.content}"
                  </p>
                </div>
                
                <div className={`mt-6 pt-4 border-t ${isWhite ? 'border-zinc-100' : 'border-white/10'}`}>
                  <h4 className={`font-extrabold text-xs md:text-sm ${isWhite ? 'text-zinc-900' : 'text-white'}`}>
                    {test.name}
                  </h4>
                  <p className={`text-[10px] md:text-xs font-semibold mt-0.5 ${isWhite ? 'text-zinc-400' : 'text-white/60'}`}>
                    {test.role} - {test.company}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Prompt indicator */}
          <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 transition-opacity duration-300 ${expandedTestimonials ? 'opacity-0' : 'opacity-100'}`}>
            <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
              Haz clic para expandir
            </span>
          </div>
        </div>
      </section>
      {/* FAQ SECTION */}
      <section id="faq" className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="bg-zinc-50 border border-zinc-200/70 rounded-[40px] px-6 py-14 md:py-16 shadow-sm">

          {/* ── Centered Header ── */}
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold text-[#4f46e5] bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" /> Preguntas Frecuentes
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
              ¿Tienes dudas?<br />
              <span className="text-[#4f46e5]">Tenemos las respuestas.</span>
            </h2>
            <p className="text-zinc-500 font-medium text-sm leading-relaxed">
              Todo lo que necesitas saber sobre izinvoice, desde cómo empezar hasta integraciones avanzadas con SUNAT.
            </p>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid md:grid-cols-12 gap-8 items-start">

            {/* LEFT: Category sidebar */}
            <div className="md:col-span-4 space-y-3">
              <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-4 px-1">
                Explorar por categoría
              </p>

              {[
                { icon: "🚀", label: "Inicio Rápido", count: 2, range: [0, 1] },
                { icon: "🔒", label: "Seguridad & SUNAT", count: 2, range: [1, 3] },
                { icon: "💳", label: "Precios & Planes", count: 2, range: [3, 5] },
                { icon: "🔌", label: "Integraciones & Soporte", count: 2, range: [5, 7] },
              ].map((cat, ci) => {
                const isActiveCat = activeFaq !== null && activeFaq >= cat.range[0] && activeFaq < cat.range[1];
                return (
                  <button
                    key={ci}
                    onClick={() => setActiveFaq(cat.range[0])}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-200 text-left group ${
                      isActiveCat
                        ? 'bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-white border-zinc-200 hover:border-indigo-300 hover:shadow-sm text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                        isActiveCat ? 'bg-white/15' : 'bg-zinc-50 border border-zinc-100'
                      }`}>
                        {cat.icon}
                      </div>
                      <div>
                        <p className={`text-xs font-extrabold ${isActiveCat ? 'text-white' : 'text-zinc-800'}`}>{cat.label}</p>
                        <p className={`text-[10px] font-medium ${isActiveCat ? 'text-indigo-200' : 'text-zinc-400'}`}>{cat.count} artículos</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 -rotate-90 shrink-0 ${isActiveCat ? 'text-white' : 'text-zinc-300 group-hover:text-indigo-400'}`} />
                  </button>
                );
              })}

              {/* Support card */}
              <div className="mt-6 bg-gradient-to-br from-[#1e1b4b] to-[#4f46e5] rounded-2xl p-5 space-y-3 shadow-lg border border-indigo-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg shrink-0">
                    💬
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs">¿Aún con dudas?</h4>
                    <p className="text-[10px] text-indigo-200/80 font-medium">Soporte en minutos.</p>
                  </div>
                </div>
                <p className="text-[10px] text-indigo-200/70 font-medium leading-relaxed">
                  Nuestro equipo de soporte está listo para ayudarte directamente por WhatsApp.
                </p>
                <a
                  href="https://wa.me/51903067489"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2.5 bg-white hover:bg-zinc-50 text-[#4f46e5] rounded-xl font-extrabold text-[11px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                >
                  Contactar Soporte
                </a>
              </div>
            </div>

            {/* RIGHT: Accordion */}
            <div className="md:col-span-8 space-y-2.5">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                      isOpen
                        ? 'border-[#4f46e5] shadow-md shadow-indigo-500/5'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <button
                      className="w-full px-6 py-4 text-left flex justify-between items-center gap-4 group"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                    >
                      <span className={`font-semibold text-sm transition-colors duration-200 ${
                        isOpen ? 'text-[#4f46e5]' : 'text-zinc-800 group-hover:text-zinc-900'
                      }`}>
                        {faq.q}
                      </span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isOpen
                          ? 'bg-[#4f46e5] text-white rotate-180'
                          : 'bg-zinc-100 text-zinc-400 group-hover:bg-indigo-50 group-hover:text-[#4f46e5]'
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          className="border-t border-indigo-100 bg-indigo-50/30"
                        >
                          <p className="px-6 py-4 text-xs text-zinc-600 font-medium leading-relaxed">
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
        </div>
      </section>

      {/* FINAL CTA - Banner Horizontal Estilo Rampay */}
      <section id="contacto" className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="bg-gradient-to-br from-[#1e1b4b] via-[#4f46e5] to-[#6366f1] rounded-[40px] overflow-hidden relative min-h-[320px] flex items-center shadow-2xl shadow-indigo-900/30">
          
          {/* Background decorative blobs */}
          <div className="absolute top-[-40%] left-[-10%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-40%] right-[20%] w-[300px] h-[300px] bg-indigo-300/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute top-1/2 -translate-y-1/2 right-[33%] w-[200px] h-[200px] bg-violet-400/10 rounded-full blur-[50px] pointer-events-none" />

          {/* LEFT: Text + CTA */}
          <div className="relative z-10 flex-1 px-8 md:px-14 py-12 max-w-[55%] space-y-6">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/90 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block" />
              SUNAT Certificado · PSE/OSE Autorizado
            </span>

            {/* Headline */}
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                Empieza a facturar<br />
                <span className="text-indigo-200">de manera inteligente</span>
              </h2>

              <p className="text-indigo-200/80 font-medium text-sm leading-relaxed max-w-sm">
                Únete a cientos de empresas peruanas que ya simplificaron su facturación electrónica con izinvoice.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => { setDemoModalContext("solicitar_demo"); setDemoModalOpen(true); }}
                className="px-6 py-3 bg-white hover:bg-zinc-50 text-[#4f46e5] rounded-full font-extrabold text-xs shadow-xl shadow-black/20 active:scale-[0.98] transition-all flex items-center gap-2 whitespace-nowrap"
              >
                Solicitar Demo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Social proof mini strip */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                {["AM","SV","CR","JP"].map((initials, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-indigo-300/30 border-2 border-indigo-400/40 flex items-center justify-center text-[8px] font-black text-white backdrop-blur-sm">
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-indigo-200/70 text-[11px] font-semibold">
                +500 empresas ya confían en izinvoice
              </p>
            </div>
          </div>

          {/* RIGHT: Ticket Mockup floating */}
          <div className="absolute right-0 top-0 bottom-0 w-[42%] flex items-center justify-center pr-8 md:pr-12 pointer-events-none select-none">
            {/* Outer glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 bg-indigo-300/20 rounded-full blur-3xl" />
            </div>

            {/* Ticket card — matches the TicketViewer design */}
            <div className="relative z-10 bg-white text-zinc-900 rounded-[24px] p-5 shadow-2xl border border-zinc-200/60 font-mono text-[8px] select-none text-left w-[200px] rotate-[3deg] hover:rotate-[0deg] transition-transform duration-500">
              {/* Header */}
              <div className="text-center space-y-0.5 mb-2">
                <div className="flex justify-center mb-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#4f46e5] flex items-center justify-center font-black text-white text-[10px] shadow-md">
                    IZ
                  </div>
                </div>
                <p className="font-extrabold text-[9px] uppercase tracking-tight text-zinc-950">MI EMPRESA S.A.C.</p>
                <p className="text-zinc-400 font-semibold text-[7px]">R.U.C. 20601482921</p>
                <p className="text-zinc-400 text-[6.5px]">Av. Javier Prado Este 1024, Lima</p>
              </div>

              <div className="border-t border-dashed border-zinc-200 my-1.5" />

              <div className="text-center space-y-0.5 mb-1.5">
                <p className="font-extrabold text-zinc-800 uppercase text-[8px]">BOLETA DE VENTA ELECTRÓNICA</p>
                <p className="font-black text-zinc-950 text-[9px] tracking-wider">B001-00083920</p>
              </div>

              <div className="border-t border-dashed border-zinc-200 my-1.5" />

              {/* Items */}
              <table className="w-full text-[7px] mb-1.5">
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  <tr>
                    <td className="py-0.5 text-center w-4">1</td>
                    <td className="py-0.5 truncate max-w-[70px]">Papel Térmico 80mm</td>
                    <td className="py-0.5 text-right font-bold">12.00</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 text-center">2</td>
                    <td className="py-0.5 truncate max-w-[70px]">Lector Cód. Barras</td>
                    <td className="py-0.5 text-right font-bold">180.00</td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t border-dashed border-zinc-200 my-1.5" />

              <div className="space-y-0.5 mb-2">
                <div className="flex justify-between text-zinc-500 text-[7px]">
                  <span>Op. Gravada:</span><span>PEN 162.71</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-[7px]">
                  <span>I.G.V. (18%):</span><span>PEN 29.29</span>
                </div>
                <div className="flex justify-between font-black text-[9px] text-zinc-950 border-t border-zinc-200 pt-1 mt-1">
                  <span>TOTAL:</span><span>PEN 192.00</span>
                </div>
              </div>

              <div className="border-t border-dashed border-zinc-200 my-1.5" />

              <div className="text-center space-y-1">
                <div className="flex justify-center">
                  <div className="w-10 h-10 border-2 border-zinc-800 rounded-sm grid grid-cols-4 gap-px p-0.5">
                    {[1,0,1,1, 0,1,0,1, 1,1,0,0, 0,1,1,1].map((v,i)=>(
                      <div key={i} className={`${v?'bg-zinc-800':'bg-white'} rounded-[1px]`} />
                    ))}
                  </div>
                </div>
                <p className="text-emerald-600 uppercase font-black text-[7px] tracking-wider">✓ SUNAT: ACEPTADO</p>
                <p className="text-zinc-400 text-[6px]">Hash: E8B9F2A1</p>
              </div>
            </div>

            {/* Second card slightly behind */}
            <div className="absolute z-[5] bg-white/90 rounded-[20px] w-[170px] h-[260px] shadow-xl border border-zinc-200/40 -rotate-[5deg] top-1/2 -translate-y-1/2 right-4 md:right-10 opacity-60" />
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="bg-[#0f0e1a] relative overflow-hidden">
        {/* Top decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
        <div className="absolute top-0 left-1/4 w-[300px] h-[200px] bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[300px] h-[200px] bg-violet-600/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">

          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

            {/* Brand column */}
            <div className="md:col-span-4 space-y-5">
              {/* Logo */}
              <div className="inline-flex bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <img src="/log.png" alt="izinvoice Logo" className="h-7 w-auto object-contain brightness-0 invert" />
              </div>

              <p className="text-zinc-400 text-xs font-medium leading-relaxed max-w-xs">
                Plataforma de facturación electrónica moderna, ágil y certificada para empresas peruanas. Integrada directamente con SUNAT.
              </p>

              {/* SUNAT badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block" />
                Homologado SUNAT · PSE/OSE Autorizado
              </div>

              {/* MindDev credit */}
              <p className="text-zinc-600 text-[11px] font-medium">
                Un producto de{" "}
                <a href="https://www.minddev.pe" target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                  MindDev
                </a>
              </p>
            </div>

            {/* Links columns */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">

              {/* Plataforma */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-widest">Plataforma</h4>
                <div className="flex flex-col gap-2.5">
                  {[
                    { label: "Inicio", href: "#inicio" },
                    { label: "Funciones", href: "#funciones" },
                    { label: "Planes", href: "#planes" },
                    { label: "Para quién es", href: "#para-quien" },
                    { label: "Preguntas Frecuentes", href: "#faq" },
                  ].map((l, i) => (
                    <a key={i} href={l.href} className="text-zinc-400 hover:text-white text-xs font-medium transition-colors duration-150">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Legal */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-widest">Legal & Soporte</h4>
                <div className="flex flex-col gap-2.5">
                  {[
                    { label: "Términos del Servicio", href: "#" },
                    { label: "Política de Privacidad", href: "#" },
                    { label: "Libro de Reclamaciones", href: "#" },
                    { label: "Soporte Técnico", href: "https://wa.me/51903067489" },
                  ].map((l, i) => (
                    <a key={i} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined} className="text-zinc-400 hover:text-white text-xs font-medium transition-colors duration-150">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Contacto */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-widest">Contacto</h4>
                <div className="flex flex-col gap-2.5 text-xs font-medium text-zinc-400">
                  <a href="https://wa.me/51903067489" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-400 transition-colors group">
                    <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">💬</span>
                    WhatsApp
                  </a>
                  <a href="mailto:contacto@izinvoice.pe" className="flex items-center gap-2 hover:text-indigo-300 transition-colors group">
                    <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">✉️</span>
                    contacto@izinvoice.pe
                  </a>
                  <span className="flex items-center gap-2 text-zinc-500">
                    <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm">📍</span>
                    San Isidro, Lima, Perú
                  </span>
                </div>

                {/* Social icons */}
                <div className="flex gap-2 pt-1">
                  {[
                    { icon: "in", href: "#", label: "LinkedIn" },
                    { icon: "ig", href: "#", label: "Instagram" },
                    { icon: "fb", href: "#", label: "Facebook" },
                  ].map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      aria-label={s.label}
                      className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-extrabold text-zinc-400 hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:text-indigo-300 transition-all"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-zinc-600 text-[11px] font-medium">
              © {new Date().getFullYear()} izinvoice. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-1.5 text-zinc-600 text-[11px] font-medium">
              Desarrollado con ❤️ por
              <a href="https://www.minddev.pe" target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                MindDev
              </a>
            </div>
          </div>

        </div>
      </footer>


      {/* DEMO REQUEST MODAL */}
      <AnimatePresence>
        {demoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setDemoModalOpen(false); setDemoFormSubmitted(false); }}
            />

            {/* Modal card — split layout */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-[780px] relative z-10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              {/* ── LEFT: Brand panel ── */}
              <div className="bg-gradient-to-br from-[#1e1b4b] via-[#4f46e5] to-[#6366f1] md:w-[42%] p-8 flex flex-col justify-between relative overflow-hidden shrink-0">
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-300/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  {/* Badge */}
                  <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/80 text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block" />
                    Solicitar Demo
                  </span>

                  {/* Headline */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                      Construyamos tu<br />
                      <span className="text-indigo-200">Facturación Digital</span>
                    </h3>
                    <p className="text-indigo-200/70 text-xs font-medium leading-relaxed">
                      Déjanos tus datos y un especialista te contactará en breve para mostrarte la plataforma.
                    </p>
                  </div>

                  {/* Contact info pills */}
                  <div className="space-y-2.5 pt-2">
                    {[
                      { icon: "💬", text: "WhatsApp: +51 903 067 489" },
                      { icon: "✉️", text: "contacto@izinvoice.pe" },
                      { icon: "📍", text: "San Isidro, Lima, Perú" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-sm shrink-0">
                          {item.icon}
                        </span>
                        <span className="text-indigo-100/70 text-[11px] font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logo bottom */}
                <div className="relative z-10 mt-8">
                  <img src="/log.png" alt="izinvoice" className="h-6 w-auto object-contain brightness-0 invert opacity-40" />
                </div>
              </div>

              {/* ── RIGHT: Form panel ── */}
              <div className="bg-white flex-1 p-8 flex flex-col">
                {/* Close button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => { setDemoModalOpen(false); setDemoFormSubmitted(false); }}
                    className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-zinc-500" />
                  </button>
                </div>

                {!demoFormSubmitted ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); setDemoFormSubmitted(true); }}
                    className="space-y-4 flex-1"
                  >
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Tu nombre</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Juan Pérez"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] transition-all"
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">WhatsApp / Celular</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 987 654 321"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Correo electrónico</label>
                      <input
                        type="email"
                        required
                        placeholder="Ej. juan@empresa.com"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] transition-all"
                      />
                    </div>

                    {/* Plan selector */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Requerimiento</label>
                      <select 
                        value={demoModalContext}
                        onChange={(e) => setDemoModalContext(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] transition-all cursor-pointer"
                      >
                        <option value="solicitar_demo">👋 Solicitar Demo General</option>
                        <option value="emprende">🚀 Plan Emprende — S/ 39/mes</option>
                        <option value="ejecutivo">⭐ Plan Ejecutivo — S/ 69/mes</option>
                        <option value="empresarial">🏢 Plan Empresarial — S/ 99/mes</option>
                        <option value="personalizado">🔌 Plan Personalizado</option>
                      </select>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-2xl font-extrabold text-xs shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      Enviar Solicitud <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-center text-zinc-400 text-[10px] font-medium">
                      Sin compromisos · Te respondemos en minutos
                    </p>
                  </form>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 py-8">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm">
                      <Check className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-zinc-900 text-lg">¡Solicitud Recibida! 🎉</h4>
                      <p className="text-xs text-zinc-500 font-medium max-w-xs leading-relaxed">
                        Un asesor de izinvoice se comunicará contigo vía WhatsApp en los próximos minutos.
                      </p>
                    </div>
                    <button
                      onClick={() => { setDemoModalOpen(false); setDemoFormSubmitted(false); }}
                      className="px-8 py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-2xl font-bold text-xs transition-all active:scale-[0.98] shadow-md shadow-indigo-500/20"
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
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
              <div className="bg-[#4f46e5] p-1.5 rounded-[10px] flex items-center justify-center shadow-md shadow-indigo-500/20">
                <img src="/log.png" alt="Logo" className="h-5 w-auto object-contain brightness-0 invert" />
              </div>
            </div>
            <div className="flex items-center gap-3">

              <button 
                onClick={() => { setDemoModalContext("solicitar_demo"); setDemoModalOpen(true); }}
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
