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
}

function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [loginForm, setLoginForm] = useState({ username: "", password: "", role: "" })
  const [loginError, setLoginError] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")

  // Estados para diferentes módulos
  const [turnos, setTurnos] = useState<Turno[]>(mockData.turnos)
  const [insumos, setInsumos] = useState<Insumo[]>(mockData.insumos)
  const [newTurno, setNewTurno] = useState({
    tipoEstudio: "",
    fecha: "",
    hora: "",
    obraSocial: "",
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    const user = mockData.users.find(
      (u) => u.username === loginForm.username && u.password === loginForm.password && u.role === loginForm.role,
    )

    if (user) {
      setCurrentUser(user)
      setActiveTab("dashboard")
    } else {
      setLoginError("Credenciales incorrectas. Verifique usuario, contraseña y tipo de usuario.")
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setLoginForm({ username: "", password: "", role: "" })
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
    alert("Turno solicitado exitosamente. Recibirá confirmación por email.")
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
        { id: "dashboard", label: "Inicio", icon: User },
        { id: "verificar-paciente", label: "Verificar Paciente", icon: User },
        { id: "estudios-urgentes", label: "Estudios Urgentes", icon: AlertTriangle },
      ],
      profesional: [
        { id: "dashboard", label: "Inicio", icon: User },
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

              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Usuario</Label>
                <Select value={loginForm.role} onValueChange={(value) => setLoginForm({ ...loginForm, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione su rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paciente">Paciente</SelectItem>
                    <SelectItem value="recepcionista">Recepcionista</SelectItem>
                    <SelectItem value="profesional">Profesional de Salud</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
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

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Usuarios de prueba:</h4>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Paciente:</strong> paciente1 / 12345678
                </p>
                <p>
                  <strong>Recepcionista:</strong> recepcionista1 / rec123
                </p>
                <p>
                  <strong>Profesional:</strong> profesional1 / prof123
                </p>
                <p>
                  <strong>Administrador:</strong> admin1 / admin123
                </p>
              </div>
            </div>
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
                      .map((turno) => (
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
                              <Button variant="outline" size="sm">
                                Modificar
                              </Button>
                              <Button variant="outline" size="sm">
                                Cancelar
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
                            <Button size="sm" variant="outline">
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
                        <Input id="dni-verificar" type="text" placeholder="Ingrese el DNI" />
                      </div>
                      <div className="flex items-end">
                        <Button>Verificar Paciente</Button>
                      </div>
                    </div>

                    <Alert>
                      <AlertDescription>
                        Ingrese el DNI del paciente para verificar su identidad y mostrar sus turnos del día.
                      </AlertDescription>
                    </Alert>
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
                  <div className="space-y-4">
                    {turnos
                      .filter((t) => t.profesionalId === currentUser.id)
                      .map((turno) => {
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
                              <Badge variant={turno.estado === "programado" ? "default" : "secondary"}>
                                {turno.estado === "programado" ? "Pendiente" : "Completado"}
                              </Badge>
                            </div>
                            {turno.estado === "programado" && (
                              <div className="mt-3">
                                <Button size="sm">Registrar Resultados</Button>
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
                          <div className="flex justify-between">
                            <span>Análisis de Sangre</span>
                            <span className="font-semibold">15</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Electrocardiograma</span>
                            <span className="font-semibold">8</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ecografía</span>
                            <span className="font-semibold">12</span>
                          </div>
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
                            <span className="font-semibold">$52,500</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Facturas Emitidas</span>
                            <span className="font-semibold">35</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pendientes</span>
                            <span className="font-semibold">3</span>
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
                            <span>Reducción de Demoras</span>
                            <span className="font-semibold text-green-600">-45%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Errores de Facturación</span>
                            <span className="font-semibold text-green-600">4%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Satisfacción</span>
                            <span className="font-semibold text-green-600">92%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6">
                    <Button>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generar Reporte Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

export default App
