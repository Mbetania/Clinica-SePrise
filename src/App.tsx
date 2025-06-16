"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  Clock,
  User,
  FileText,
  Package,
  DollarSign,
  BarChart3,
  LogOut,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import mockData from "./data/mockData.json"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface UserType {
  id: number
  username: string
  password: string
  role: string
  name: string
  dni: string
  email: string
  phone: string
  obraSocial?: string
  especialidad?: string
}

interface Turno {
  id: number
  pacienteId: number
  tipoEstudio: string
  fecha: string
  hora: string
  estado: string
  profesionalId: number
  requiereAyuno: boolean
}

interface Insumo {
  id: number
  nombre: string
  descripcion: string
  stockActual: number
  stockMinimo: number
  unidad: string
  departamento: string
}

interface Factura {
  id: number
  turnoId: number
  pacienteId: number
  monto: number
  obraSocial: string | null
  fecha: string
  estado: "pendiente" | "pagada"
}

function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchDNI, setSearchDNI] = useState("")
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [resultadoText, setResultadoText] = useState("")
  const [showResultadoDialog, setShowResultadoDialog] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState<UserType | null>(null)
  const [showResultadoDetalle, setShowResultadoDetalle] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [estudios, setEstudios] = useState(mockData.estudios)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showModificarDialog, setShowModificarDialog] = useState(false)
  const [turnoAModificar, setTurnoAModificar] = useState<Turno | null>(null)
  const [nuevaFecha, setNuevaFecha] = useState("")
  const [nuevaHora, setNuevaHora] = useState("")

  // Estados para diferentes módulos
  const [turnos, setTurnos] = useState<Turno[]>(mockData.turnos)
  const [insumos, setInsumos] = useState<Insumo[]>(mockData.insumos)
  const [newTurno, setNewTurno] = useState({
    tipoEstudio: "",
    fecha: "",
    hora: "",
    obraSocial: "",
  })
  const [facturas, setFacturas] = useState<Factura[]>(mockData.facturas.map(f => ({
    ...f,
    estado: f.estado as "pendiente" | "pagada"
  })))
  const [showReporteDialog, setShowReporteDialog] = useState(false)
  const [reporteData, setReporteData] = useState<any>(null)
  const [showReponerStockDialog, setShowReponerStockDialog] = useState(false)
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null)
  const [showTurnoConfirmDialog, setShowTurnoConfirmDialog] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    const user = mockData.users.find(
      (u) => u.username === loginForm.username && u.password === loginForm.password
    )

    if (user) {
      setCurrentUser(user)
      setActiveTab("dashboard")
    } else {
      setLoginError("Credenciales incorrectas. Verifique usuario y contraseña.")
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setLoginForm({ username: "", password: "" })
    setActiveTab("dashboard")
  }

  const handleSolicitarTurno = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    const tipoEstudioData = mockData.tiposEstudio.find((t) => t.nombre === newTurno.tipoEstudio)

    const nuevoTurno: Turno = {
      id: turnos.length + 1,
      pacienteId: currentUser.id,
      tipoEstudio: newTurno.tipoEstudio,
      fecha: newTurno.fecha,
      hora: newTurno.hora,
      estado: "programado",
      profesionalId: 3, // Dr. Carlos López por defecto
      requiereAyuno: tipoEstudioData?.requiereAyuno || false,
    }

    setTurnos([...turnos, nuevoTurno])
    setNewTurno({ tipoEstudio: "", fecha: "", hora: "", obraSocial: "" })
    setShowTurnoConfirmDialog(true)
  }

  const getInsumosConAlerta = () => {
    return insumos.filter((insumo) => insumo.stockActual <= insumo.stockMinimo)
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      paciente: "Paciente",
      recepcionista: "Recepcionista",
      profesional: "Profesional de Salud",
      administrador: "Administrador",
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  const getMenuItems = (role: string) => {
    const menus = {
      paciente: [
        { id: "dashboard", label: "Inicio", icon: User },
        { id: "turnos", label: "Mis Turnos", icon: Calendar },
        { id: "solicitar-turno", label: "Solicitar Turno", icon: Clock },
        { id: "resultados", label: "Resultados", icon: FileText },
      ],
      recepcionista: [
        { id: "verificar-paciente", label: "Verificar Paciente", icon: User },
        { id: "estudios-urgentes", label: "Estudios Urgentes", icon: AlertTriangle },
      ],
      profesional: [
        { id: "agenda", label: "Mi Agenda", icon: Calendar },
        { id: "registrar-resultados", label: "Registrar Resultados", icon: FileText },
        { id: "historial", label: "Historial Clínico", icon: FileText },
      ],
      administrador: [
        { id: "dashboard", label: "Inicio", icon: User },
        { id: "insumos", label: "Gestión de Insumos", icon: Package },
        { id: "reportes", label: "Reportes", icon: BarChart3 },
        { id: "facturacion", label: "Facturación", icon: DollarSign },
      ],
    }
    return menus[role as keyof typeof menus] || []
  }

  const handleRegistrarResultado = (turno: Turno) => {
    setSelectedTurno(turno)
    const estudioExistente = estudios.find(e => e.turnoId === turno.id)
    setResultadoText(estudioExistente?.resultados || "")
    setShowResultadoDialog(true)
  }

  const handleGuardarResultado = () => {
    if (!selectedTurno || !resultadoText) return

    // Actualizar el turno
    const turnoActualizado = { ...selectedTurno, estado: "completado" }
    setTurnos(turnos.map(t => t.id === selectedTurno.id ? turnoActualizado : t))
    
    // Actualizar o crear el estudio
    const estudioExistente = estudios.find(e => e.turnoId === selectedTurno.id)
    if (estudioExistente) {
      setEstudios(estudios.map(e => 
        e.turnoId === selectedTurno.id 
          ? { ...e, resultados: resultadoText }
          : e
      ))
    } else {
      const nuevoEstudio = {
        id: estudios.length + 1,
        turnoId: selectedTurno.id,
        pacienteId: selectedTurno.pacienteId,
        tipoEstudio: selectedTurno.tipoEstudio,
        resultados: resultadoText,
        fechaRealizacion: new Date().toISOString().split('T')[0],
        profesionalId: currentUser?.id || 0,
        estado: "completado"
      }
      setEstudios([...estudios, nuevoEstudio])
    }
    
    // Limpiamos el estado
    setSelectedTurno(null)
    setResultadoText("")
    setShowResultadoDialog(false)
    setIsEditing(false)
  }

  const handleEditarResultado = () => {
    setIsEditing(true)
    setShowResultadoDetalle(false)
    setShowResultadoDialog(true)
  }

  const getEstudioByTurnoId = (turnoId: number) => {
    return estudios.find(e => e.turnoId === turnoId)
  }

  const getPacientesFiltrados = () => {
    if (!searchDNI) return []
    return mockData.users.filter(user => 
      user.role === "paciente" && 
      user.dni.includes(searchDNI)
    )
  }

  const getTurnosPaciente = (pacienteId: number) => {
    return turnos.filter(t => 
      t.pacienteId === pacienteId && 
      t.profesionalId === currentUser?.id
    )
  }

  const getTurnosPorEstado = (estado: string) => {
    return turnos.filter(t => 
      t.profesionalId === currentUser?.id && 
      t.estado === estado
    )
  }

  const handleCancelarTurno = (turno: Turno) => {
    setSelectedTurno(turno)
    setShowCancelDialog(true)
  }

  const confirmarCancelacion = () => {
    if (!selectedTurno) return
    setTurnos(turnos.filter(t => t.id !== selectedTurno.id))
    setShowCancelDialog(false)
    setSelectedTurno(null)
  }

  const handleModificarTurno = (turno: Turno) => {
    setTurnoAModificar(turno)
    setNuevaFecha(turno.fecha)
    setNuevaHora(turno.hora)
    setShowModificarDialog(true)
  }

  const guardarModificacionTurno = () => {
    if (!turnoAModificar || !nuevaFecha || !nuevaHora) return

    const turnoModificado = {
      ...turnoAModificar,
      fecha: nuevaFecha,
      hora: nuevaHora
    }

    setTurnos(turnos.map(t => t.id === turnoAModificar.id ? turnoModificado : t))
    setShowModificarDialog(false)
    setTurnoAModificar(null)
    setNuevaFecha("")
    setNuevaHora("")
  }

  const handleReponerStock = (insumo: Insumo) => {
    setSelectedInsumo(insumo)
    setShowReponerStockDialog(true)
  }

  const generarReporteCompleto = () => {
    const reporte = {
      estudiosPorTipo: mockData.tiposEstudio.map(tipo => ({
        nombre: tipo.nombre,
        cantidad: turnos.filter(t => t.tipoEstudio === tipo.nombre).length
      })),
      facturacionTotal: facturas.reduce((acc, f) => acc + f.monto, 0),
      facturasPendientes: facturas.filter(f => f.estado === "pendiente").length,
      facturasPagadas: facturas.filter(f => f.estado === "pagada").length,
      estudiosPorObraSocial: mockData.obrasSociales.map(obra => ({
        nombre: obra.nombre,
        cantidad: turnos.filter(t => {
          const factura = facturas.find(f => f.turnoId === t.id)
          return factura?.obraSocial === obra.nombre
        }).length
      })),
      insumosBajos: insumos.filter(i => i.stockActual <= i.stockMinimo).length
    }

    setReporteData(reporte)
    setShowReporteDialog(true)
  }

  const handleMarcarComoPagada = (facturaId: number) => {
    setFacturas(facturas.map(f => 
      f.id === facturaId 
        ? { ...f, estado: "pagada" }
        : f
    ))
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-900">Clínica SePrice</CardTitle>
            <CardDescription>Sistema de Gestión de Estudios Clínicos</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Ingrese su usuario"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Ingrese su contraseña"
                  required
                />
              </div>

              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full">
                Iniciar Sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const menuItems = getMenuItems(currentUser.role)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-900">Clínica SePrice</h1>
              <Badge variant="secondary" className="ml-3">
                {getRoleDisplayName(currentUser.role)}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bienvenido, {currentUser.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            {menuItems.map((item) => (
              <TabsTrigger key={item.id} value={item.id} className="flex items-center gap-2">
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentUser.role === "paciente" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Información Personal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <strong>Nombre:</strong> {currentUser.name}
                      </p>
                      <p>
                        <strong>DNI:</strong> {currentUser.dni}
                      </p>
                      <p>
                        <strong>Email:</strong> {currentUser.email}
                      </p>
                      <p>
                        <strong>Teléfono:</strong> {currentUser.phone}
                      </p>
                      {currentUser.obraSocial && (
                        <p>
                          <strong>Obra Social:</strong> {currentUser.obraSocial}
                        </p>
                      )}
                      {currentUser.especialidad && (
                        <p>
                          <strong>Especialidad:</strong> {currentUser.especialidad}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentUser.role === "administrador" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Alertas de Insumos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getInsumosConAlerta().length > 0 ? (
                      <div className="space-y-2">
                        {getInsumosConAlerta().map((insumo) => (
                          <div key={insumo.id} className="p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                            <p className="font-medium">{insumo.nombre}</p>
                            <p className="text-sm text-gray-600">
                              Stock: {insumo.stockActual} / Mínimo: {insumo.stockMinimo}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Todos los insumos en stock adecuado
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {currentUser.role === "paciente" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Próximos Turnos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {turnos.filter((t) => t.pacienteId === currentUser.id && t.estado === "programado").length > 0 ? (
                      <div className="space-y-2">
                        {turnos
                          .filter((t) => t.pacienteId === currentUser.id && t.estado === "programado")
                          .map((turno) => (
                            <div key={turno.id} className="p-2 bg-blue-50 rounded">
                              <p className="font-medium">{turno.tipoEstudio}</p>
                              <p className="text-sm text-gray-600">
                                {turno.fecha} - {turno.hora}
                              </p>
                              {turno.requiereAyuno && (
                                <Badge variant="outline" className="text-xs">
                                  Requiere ayuno
                                </Badge>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No tiene turnos programados</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Solicitar Turno - Solo Pacientes */}
          {currentUser.role === "paciente" && (
            <TabsContent value="solicitar-turno">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitar Turno para Estudio Clínico</CardTitle>
                  <CardDescription>
                    Complete el formulario para programar su estudio. Recibirá confirmación por email.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSolicitarTurno} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipoEstudio">Tipo de Estudio</Label>
                        <Select
                          value={newTurno.tipoEstudio}
                          onValueChange={(value) => setNewTurno({ ...newTurno, tipoEstudio: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione el estudio" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockData.tiposEstudio.map((tipo) => (
                              <SelectItem key={tipo.id} value={tipo.nombre}>
                                {tipo.nombre}
                                {tipo.requiereAyuno && " (Requiere ayuno)"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fecha">Fecha</Label>
                        <Input
                          id="fecha"
                          type="date"
                          value={newTurno.fecha}
                          onChange={(e) => setNewTurno({ ...newTurno, fecha: e.target.value })}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hora">Hora</Label>
                        <Select
                          value={newTurno.hora}
                          onValueChange={(value) => setNewTurno({ ...newTurno, hora: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione la hora" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="08:00">08:00</SelectItem>
                            <SelectItem value="09:00">09:00</SelectItem>
                            <SelectItem value="10:00">10:00</SelectItem>
                            <SelectItem value="11:00">11:00</SelectItem>
                            <SelectItem value="14:00">14:00</SelectItem>
                            <SelectItem value="15:00">15:00</SelectItem>
                            <SelectItem value="16:00">16:00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="obraSocial">Obra Social</Label>
                        <Select
                          value={newTurno.obraSocial}
                          onValueChange={(value) => setNewTurno({ ...newTurno, obraSocial: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione su obra social" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockData.obrasSociales.map((obra) => (
                              <SelectItem key={obra.id} value={obra.nombre}>
                                {obra.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {newTurno.tipoEstudio && (
                      <Alert>
                        <AlertDescription>
                          {mockData.tiposEstudio.find((t) => t.nombre === newTurno.tipoEstudio)?.requiereAyuno
                            ? `⚠️ Este estudio requiere ayuno de 8 horas. Horarios disponibles: 7:00 AM - 11:00 AM`
                            : `✅ Este estudio no requiere ayuno. Horarios disponibles: 7:00 AM - 5:00 PM`}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full">
                      Solicitar Turno
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Mis Turnos - Solo Pacientes */}
          {currentUser.role === "paciente" && (
            <TabsContent value="turnos">
              <Card>
                <CardHeader>
                  <CardTitle>Mis Turnos</CardTitle>
                  <CardDescription>Gestione sus turnos programados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {turnos
                      .filter((t) => t.pacienteId === currentUser.id)
                      .map((turno) => {
                        const estudio = getEstudioByTurnoId(turno.id)
                        return (
                          <div key={turno.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{turno.tipoEstudio}</h3>
                                <p className="text-gray-600">
                                  {turno.fecha} - {turno.hora}
                                </p>
                                {turno.requiereAyuno && (
                                  <Badge variant="outline" className="mt-1">
                                    Requiere ayuno de 8 horas
                                  </Badge>
                                )}
                              </div>
                              <Badge variant={turno.estado === "programado" ? "default" : "secondary"}>
                                {turno.estado === "programado" ? "Programado" : "Completado"}
                              </Badge>
                            </div>
                            {turno.estado === "programado" && (
                              <div className="mt-3 space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleModificarTurno(turno)}
                                >
                                  Modificar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCancelarTurno(turno)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            )}
                            {estudio && (
                              <div className="mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTurno(turno)
                                    setResultadoText(estudio.resultados)
                                    setShowResultadoDetalle(true)
                                  }}
                                >
                                  Ver Resultado
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Resultados - Solo Pacientes */}
          {currentUser.role === "paciente" && (
            <TabsContent value="resultados">
              <Card>
                <CardHeader>
                  <CardTitle>Mis Resultados</CardTitle>
                  <CardDescription>Historial de resultados de estudios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {estudios
                      .filter(e => e.pacienteId === currentUser.id)
                      .map(estudio => {
                        const turno = turnos.find(t => t.id === estudio.turnoId)
                        return (
                          <div key={estudio.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{estudio.tipoEstudio}</h3>
                                <p className="text-gray-600">
                                  Fecha de realización: {estudio.fechaRealizacion}
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedTurno(turno || null)
                                  setResultadoText(estudio.resultados)
                                  setShowResultadoDetalle(true)
                                }}
                              >
                                Ver Resultado
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    {estudios.filter(e => e.pacienteId === currentUser.id).length === 0 && (
                      <p className="text-gray-500">No hay resultados disponibles</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Gestión de Insumos - Solo Administradores */}
          {currentUser.role === "administrador" && (
            <TabsContent value="insumos">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Insumos Médicos</CardTitle>
                  <CardDescription>Control de stock y alertas de reposición</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insumos.map((insumo) => (
                      <div key={insumo.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{insumo.nombre}</h3>
                            <p className="text-gray-600">{insumo.descripcion}</p>
                            <div className="mt-2 flex items-center gap-4">
                              <span>
                                Stock actual:{" "}
                                <strong>
                                  {insumo.stockActual} {insumo.unidad}
                                </strong>
                              </span>
                              <span>
                                Stock mínimo: {insumo.stockMinimo} {insumo.unidad}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {insumo.stockActual <= insumo.stockMinimo ? (
                              <Badge variant="destructive">Stock Bajo</Badge>
                            ) : (
                              <Badge variant="default">Stock OK</Badge>
                            )}
                          </div>
                        </div>
                        {insumo.stockActual <= insumo.stockMinimo && (
                          <div className="mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleReponerStock(insumo)}
                            >
                              Reponer Stock
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Verificar Paciente - Solo Recepcionistas */}
          {currentUser.role === "recepcionista" && (
            <TabsContent value="verificar-paciente">
              <Card>
                <CardHeader>
                  <CardTitle>Verificar Identidad y Turno</CardTitle>
                  <CardDescription>Valide la identidad del paciente y confirme su turno</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dni-verificar">DNI del Paciente</Label>
                        <Input 
                          id="dni-verificar" 
                          type="text" 
                          placeholder="Ingrese el DNI"
                          value={searchDNI}
                          onChange={(e) => setSearchDNI(e.target.value)}
                        />
                      </div>
                    </div>

                    {searchDNI && (
                      <div className="space-y-4">
                        {getPacientesFiltrados().map((paciente) => (
                          <Card key={paciente.id}>
                            <CardHeader>
                              <CardTitle className="text-lg">{paciente.name}</CardTitle>
                              <CardDescription>DNI: {paciente.dni}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-gray-600">{paciente.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Teléfono</p>
                                    <p className="text-sm text-gray-600">{paciente.phone}</p>
                                  </div>
                                  {paciente.obraSocial && (
                                    <div>
                                      <p className="text-sm font-medium">Obra Social</p>
                                      <p className="text-sm text-gray-600">{paciente.obraSocial}</p>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-4">
                                  <h4 className="font-medium mb-2">Turnos del Día</h4>
                                  {turnos
                                    .filter(t => 
                                      t.pacienteId === paciente.id && 
                                      t.fecha === new Date().toISOString().split('T')[0]
                                    )
                                    .map(turno => (
                                      <div key={turno.id} className="p-3 bg-gray-50 rounded-lg mt-2">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <p className="font-medium">{turno.tipoEstudio}</p>
                                            <p className="text-sm text-gray-600">{turno.hora}</p>
                                          </div>
                                          <Badge variant={turno.estado === "programado" ? "default" : "secondary"}>
                                            {turno.estado === "programado" ? "Pendiente" : "Completado"}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  {turnos.filter(t => 
                                    t.pacienteId === paciente.id && 
                                    t.fecha === new Date().toISOString().split('T')[0]
                                  ).length === 0 && (
                                    <p className="text-gray-500 text-sm">No tiene turnos programados para hoy</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {getPacientesFiltrados().length === 0 && (
                          <Alert>
                            <AlertDescription>No se encontraron pacientes con ese DNI</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Agenda - Solo Profesionales */}
          {currentUser.role === "profesional" && (
            <TabsContent value="agenda">
              <Card>
                <CardHeader>
                  <CardTitle>Mi Agenda</CardTitle>
                  <CardDescription>Pacientes asignados para hoy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Turnos Pendientes */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Turnos Pendientes</h3>
                      <div className="space-y-4">
                        {getTurnosPorEstado("programado").map((turno) => {
                          const paciente = mockData.users.find((u) => u.id === turno.pacienteId)
                          return (
                            <div key={turno.id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{turno.tipoEstudio}</h3>
                                  <p className="text-gray-600">Paciente: {paciente?.name}</p>
                                  <p className="text-gray-600">
                                    {turno.fecha} - {turno.hora}
                                  </p>
                                </div>
                                <Badge variant="default">Pendiente</Badge>
                              </div>
                              <div className="mt-3">
                                <Button 
                                  size="sm"
                                  onClick={() => handleRegistrarResultado(turno)}
                                >
                                  Registrar Resultados
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                        {getTurnosPorEstado("programado").length === 0 && (
                          <p className="text-gray-500">No hay turnos pendientes</p>
                        )}
                      </div>
                    </div>

                    {/* Turnos Completados */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Turnos Completados</h3>
                      <div className="space-y-4">
                        {getTurnosPorEstado("completado").map((turno) => {
                          const paciente = mockData.users.find((u) => u.id === turno.pacienteId)
                          const estudio = getEstudioByTurnoId(turno.id)
                          return (
                            <div key={turno.id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{turno.tipoEstudio}</h3>
                                  <p className="text-gray-600">Paciente: {paciente?.name}</p>
                                  <p className="text-gray-600">
                                    {turno.fecha} - {turno.hora}
                                  </p>
                                </div>
                                <Badge variant="secondary">Completado</Badge>
                              </div>
                              {estudio && (
                                <div className="mt-3">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedTurno(turno)
                                      setResultadoText(estudio.resultados)
                                      setShowResultadoDetalle(true)
                                    }}
                                  >
                                    Ver Resultado
                                  </Button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                        {getTurnosPorEstado("completado").length === 0 && (
                          <p className="text-gray-500">No hay turnos completados</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Registrar Resultados - Solo Profesionales */}
          {currentUser.role === "profesional" && (
            <TabsContent value="registrar-resultados">
              <Card>
                <CardHeader>
                  <CardTitle>Registrar Resultados de Estudios</CardTitle>
                  <CardDescription>Busque pacientes por DNI para registrar resultados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label htmlFor="search-dni">Buscar por DNI</Label>
                        <Input
                          id="search-dni"
                          value={searchDNI}
                          onChange={(e) => setSearchDNI(e.target.value)}
                          placeholder="Ingrese DNI del paciente"
                        />
                      </div>
                    </div>

                    {searchDNI && (
                      <div className="space-y-4">
                        {getPacientesFiltrados().map((paciente) => (
                          <Card key={paciente.id}>
                            <CardHeader>
                              <CardTitle className="text-lg">{paciente.name}</CardTitle>
                              <CardDescription>DNI: {paciente.dni}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {getTurnosPaciente(paciente.id).map((turno) => {
                                  const estudio = getEstudioByTurnoId(turno.id)
                                  return (
                                    <div key={turno.id} className="p-4 border rounded-lg">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h3 className="font-semibold">{turno.tipoEstudio}</h3>
                                          <p className="text-gray-600">
                                            {turno.fecha} - {turno.hora}
                                          </p>
                                          <Badge variant={turno.estado === "programado" ? "default" : "secondary"}>
                                            {turno.estado === "programado" ? "Pendiente" : "Completado"}
                                          </Badge>
                                        </div>
                                        <div className="flex gap-2">
                                          {turno.estado === "programado" ? (
                                            <Button 
                                              size="sm"
                                              onClick={() => handleRegistrarResultado(turno)}
                                            >
                                              Registrar Resultado
                                            </Button>
                                          ) : (
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              onClick={() => {
                                                setSelectedTurno(turno)
                                                setResultadoText(estudio?.resultados || "")
                                                setShowResultadoDetalle(true)
                                              }}
                                            >
                                              Ver Resultado
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                                {getTurnosPaciente(paciente.id).length === 0 && (
                                  <p className="text-gray-500">No hay turnos para este paciente</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {getPacientesFiltrados().length === 0 && (
                          <Alert>
                            <AlertDescription>No se encontraron pacientes con ese DNI</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Dialog para registrar/editar resultado */}
          <Dialog open={showResultadoDialog} onOpenChange={setShowResultadoDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Editar Resultado" : "Registrar Resultado"}</DialogTitle>
                <DialogDescription>
                  {selectedTurno && (
                    <div className="space-y-2">
                      <div className="font-medium">{selectedTurno.tipoEstudio}</div>
                      <div className="text-sm text-gray-500">
                        {selectedTurno.fecha} - {selectedTurno.hora}
                      </div>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="resultado">Resultado del Estudio</Label>
                  <Textarea
                    id="resultado"
                    value={resultadoText}
                    onChange={(e) => setResultadoText(e.target.value)}
                    placeholder="Ingrese los resultados del estudio..."
                    className="min-h-[200px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowResultadoDialog(false)
                  setIsEditing(false)
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleGuardarResultado}>
                  {isEditing ? "Guardar Cambios" : "Guardar Resultado"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog para ver resultado */}
          <Dialog open={showResultadoDetalle} onOpenChange={setShowResultadoDetalle}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Resultado del Estudio</DialogTitle>
                <DialogDescription>
                  {selectedTurno && (
                    <div className="space-y-2">
                      <div className="font-medium">{selectedTurno.tipoEstudio}</div>
                      <div className="text-sm text-gray-500">
                        {selectedTurno.fecha} - {selectedTurno.hora}
                      </div>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Resultado</Label>
                  <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {resultadoText}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResultadoDetalle(false)}>
                  Cerrar
                </Button>
                {currentUser?.role === "profesional" && (
                  <Button onClick={handleEditarResultado}>
                    Editar Resultado
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog para confirmar cancelación */}
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Cancelación</DialogTitle>
                <DialogDescription>
                  ¿Está seguro que desea cancelar este turno? Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                  No, mantener turno
                </Button>
                <Button variant="destructive" onClick={confirmarCancelacion}>
                  Sí, cancelar turno
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog para modificar turno */}
          <Dialog open={showModificarDialog} onOpenChange={setShowModificarDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Modificar Turno</DialogTitle>
                <DialogDescription>
                  Seleccione la nueva fecha y hora para su turno
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora</Label>
                  <Select
                    value={nuevaHora}
                    onValueChange={setNuevaHora}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la hora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">08:00</SelectItem>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="11:00">11:00</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="15:00">15:00</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowModificarDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={guardarModificacionTurno}>
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog para confirmar reposición de stock */}
          <Dialog open={showReponerStockDialog} onOpenChange={setShowReponerStockDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Reposición de Stock</DialogTitle>
                <DialogDescription>
                  {selectedInsumo && (
                    <div className="space-y-2">
                      <p className="font-medium">{selectedInsumo.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {selectedInsumo.nombre.toLowerCase().includes("tubo")
                          ? "Se realizará un pedido al laboratorio"
                          : `Se solicitará a ${selectedInsumo.departamento}`}
                      </p>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReponerStockDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  setShowReponerStockDialog(false)
                  setSelectedInsumo(null)
                }}>
                  Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog para confirmar turno solicitado */}
          <Dialog open={showTurnoConfirmDialog} onOpenChange={setShowTurnoConfirmDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Turno Solicitado</DialogTitle>
                <DialogDescription>
                  Su turno ha sido programado exitosamente. Recibirá confirmación por email.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setShowTurnoConfirmDialog(false)}>
                  Aceptar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reportes - Solo Administradores */}
          {currentUser.role === "administrador" && (
            <TabsContent value="reportes">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes Estadísticos</CardTitle>
                  <CardDescription>Análisis de rendimiento y estadísticas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Estudios por Tipo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {mockData.tiposEstudio.map(tipo => {
                            const cantidad = turnos.filter(t => t.tipoEstudio === tipo.nombre).length
                            return (
                              <div key={tipo.id} className="flex justify-between">
                                <span>{tipo.nombre}</span>
                                <span className="font-semibold">{cantidad}</span>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Facturación Mensual</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Facturado</span>
                            <span className="font-semibold">
                              ${facturas.reduce((acc, f) => acc + f.monto, 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Facturas Emitidas</span>
                            <span className="font-semibold">{facturas.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pendientes</span>
                            <span className="font-semibold">
                              {facturas.filter(f => f.estado === "pendiente").length}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Rendimiento</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Turnos Completados</span>
                            <span className="font-semibold text-green-600">
                              {turnos.filter(t => t.estado === "completado").length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Turnos Pendientes</span>
                            <span className="font-semibold text-orange-600">
                              {turnos.filter(t => t.estado === "programado").length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Insumos Bajos</span>
                            <span className="font-semibold text-red-600">
                              {insumos.filter(i => i.stockActual <= i.stockMinimo).length}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6">
                    <Button onClick={generarReporteCompleto}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generar Reporte Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Facturación - Solo Administradores */}
          {currentUser.role === "administrador" && (
            <TabsContent value="facturacion">
              <Card>
                <CardHeader>
                  <CardTitle>Facturación</CardTitle>
                  <CardDescription>Gestión de facturas y pagos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {facturas.map((factura) => {
                      const turno = turnos.find(t => t.id === factura.turnoId)
                      const paciente = mockData.users.find(u => u.id === factura.pacienteId)
                      const montoConDescuento = factura.obraSocial 
                        ? factura.monto * 0.7 // 30% de descuento con obra social
                        : factura.monto

                      return (
                        <div key={factura.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">
                                {turno?.tipoEstudio} - {paciente?.name}
                              </h3>
                              <p className="text-gray-600">
                                Fecha: {factura.fecha}
                              </p>
                              <p className="text-gray-600">
                                {factura.obraSocial 
                                  ? `Obra Social: ${factura.obraSocial}`
                                  : "Particular"}
                              </p>
                              <div className="mt-2">
                                <p className="font-medium">
                                  Monto: ${montoConDescuento.toFixed(2)}
                                  {factura.obraSocial && (
                                    <span className="text-sm text-gray-500 ml-2">
                                      (Descuento aplicado: 30%)
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <Badge variant={factura.estado === "pagada" ? "default" : "secondary"}>
                              {factura.estado === "pagada" ? "Pagada" : "Pendiente"}
                            </Badge>
                          </div>
                          {factura.estado === "pendiente" && (
                            <div className="mt-3">
                              <Button 
                                size="sm"
                                onClick={() => handleMarcarComoPagada(factura.id)}
                              >
                                Marcar como Pagada
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Dialog para reporte completo */}
      <Dialog open={showReporteDialog} onOpenChange={setShowReporteDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reporte Completo</DialogTitle>
            <DialogDescription>
              Información detallada del sistema
            </DialogDescription>
          </DialogHeader>
          {reporteData && (
            <div className="grid gap-4 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Estudios por Tipo</h3>
                  <div className="space-y-2">
                    {reporteData.estudiosPorTipo.map((estudio: any) => (
                      <div key={estudio.nombre} className="flex justify-between">
                        <span>{estudio.nombre}</span>
                        <span className="font-medium">{estudio.cantidad}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Facturación</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Facturado</span>
                      <span className="font-semibold">${reporteData.facturacionTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Facturas Pendientes</span>
                      <span className="font-semibold">{reporteData.facturasPendientes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Facturas Pagadas</span>
                      <span className="font-semibold">{reporteData.facturasPagadas}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Estudios por Obra Social</h3>
                  <div className="space-y-2">
                    {reporteData.estudiosPorObraSocial.map((obra: any) => (
                      <div key={obra.nombre} className="flex justify-between">
                        <span>{obra.nombre}</span>
                        <span className="font-medium">{obra.cantidad}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Alertas</h3>
                  <div className="flex justify-between">
                    <span>Insumos con Stock Bajo</span>
                    <span className="font-medium">{reporteData.insumosBajos}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReporteDialog(false)}>
              Cerrar
            </Button>
            <Button onClick={() => window.print()}>
              Imprimir Reporte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App
