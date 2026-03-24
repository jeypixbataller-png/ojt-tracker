import { createContext, useContext, useState, useCallback } from 'react'

const translations = {
  en: {
    // Nav
    dashboard: 'Dashboard', timeLogs: 'Time Logs', tasks: 'Tasks', calendar: 'Calendar',
    reports: 'Reports', announcements: 'Announcements', notes: 'Notes', certificate: 'Certificate',
    settings: 'Settings', goals: 'Goals', documents: 'Documents', userManagement: 'User Management',
    // Common
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', add: 'Add', search: 'Search',
    loading: 'Loading...', noData: 'No data', signOut: 'Sign Out', darkMode: 'Dark Mode', lightMode: 'Light Mode',
    // Dashboard
    goodMorning: 'Good morning', goodAfternoon: 'Good afternoon', goodEvening: 'Good evening',
    totalHours: 'Total Hours', remaining: 'Remaining', thisWeek: 'This Week', dayStreak: 'Day Streak',
    overallCompletion: 'Overall Completion', weeklyHours: 'Weekly Hours', dailyMood: 'Daily Mood',
    recentLogs: 'Recent Logs', pendingTasks: 'Pending Tasks', customize: 'Customize',
    // Auth
    signIn: 'Sign In', signUp: 'Sign Up', email: 'Email', password: 'Password', fullName: 'Full Name',
    school: 'School / University', forgotPassword: 'Forgot password?', createAccount: 'Create Account',
    // Tasks
    addTask: 'Add Task', newTask: 'New Task', title: 'Title', description: 'Description',
    priority: 'Priority', status: 'Status', dueDate: 'Due Date', overdue: 'Overdue',
    toDo: 'To Do', inProgress: 'In Progress', done: 'Done',
    low: 'Low', normal: 'Normal', high: 'High',
    // Logs
    addLog: 'Log Entry', date: 'Date', timeIn: 'Time In', timeOut: 'Time Out',
    breakMinutes: 'Break', hoursWorked: 'Hours', mood: 'Mood',
    // Language
    language: 'Language',
  },
  fil: {
    dashboard: 'Dashboard', timeLogs: 'Oras ng Pag-log', tasks: 'Mga Gawain', calendar: 'Kalendaryo',
    reports: 'Mga Ulat', announcements: 'Mga Anunsyo', notes: 'Mga Tala', certificate: 'Sertipiko',
    settings: 'Mga Setting', goals: 'Mga Layunin', documents: 'Mga Dokumento', userManagement: 'Pamamahala ng Gumagamit',
    save: 'I-save', cancel: 'Kanselahin', delete: 'Burahin', edit: 'I-edit', add: 'Idagdag', search: 'Maghanap',
    loading: 'Naglo-load...', noData: 'Walang data', signOut: 'Mag-sign Out', darkMode: 'Dark Mode', lightMode: 'Light Mode',
    goodMorning: 'Magandang umaga', goodAfternoon: 'Magandang hapon', goodEvening: 'Magandang gabi',
    totalHours: 'Kabuuang Oras', remaining: 'Natitira', thisWeek: 'Ngayong Linggo', dayStreak: 'Sunod-sunod na Araw',
    overallCompletion: 'Kabuuang Pagkumpleto', weeklyHours: 'Lingguhang Oras', dailyMood: 'Araw-araw na Mood',
    recentLogs: 'Kamakailang Logs', pendingTasks: 'Mga Naghihintay na Gawain', customize: 'I-customize',
    signIn: 'Mag-sign In', signUp: 'Mag-sign Up', email: 'Email', password: 'Password', fullName: 'Buong Pangalan',
    school: 'Paaralan / Unibersidad', forgotPassword: 'Nakalimutan ang password?', createAccount: 'Gumawa ng Account',
    addTask: 'Magdagdag ng Gawain', newTask: 'Bagong Gawain', title: 'Pamagat', description: 'Paglalarawan',
    priority: 'Priyoridad', status: 'Katayuan', dueDate: 'Takdang Petsa', overdue: 'Lampas na',
    toDo: 'Gagawin', inProgress: 'Ginagawa', done: 'Tapos',
    low: 'Mababa', normal: 'Normal', high: 'Mataas',
    addLog: 'I-log', date: 'Petsa', timeIn: 'Oras Pasok', timeOut: 'Oras Labas',
    breakMinutes: 'Break', hoursWorked: 'Oras', mood: 'Mood',
    language: 'Wika',
  },
  es: {
    dashboard: 'Panel', timeLogs: 'Registro de Horas', tasks: 'Tareas', calendar: 'Calendario',
    reports: 'Informes', announcements: 'Anuncios', notes: 'Notas', certificate: 'Certificado',
    settings: 'Configuración', goals: 'Metas', documents: 'Documentos', userManagement: 'Gestión de Usuarios',
    save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', add: 'Añadir', search: 'Buscar',
    loading: 'Cargando...', noData: 'Sin datos', signOut: 'Cerrar Sesión', darkMode: 'Modo Oscuro', lightMode: 'Modo Claro',
    goodMorning: 'Buenos días', goodAfternoon: 'Buenas tardes', goodEvening: 'Buenas noches',
    totalHours: 'Horas Totales', remaining: 'Restante', thisWeek: 'Esta Semana', dayStreak: 'Racha de Días',
    overallCompletion: 'Progreso Total', weeklyHours: 'Horas Semanales', dailyMood: 'Ánimo Diario',
    recentLogs: 'Registros Recientes', pendingTasks: 'Tareas Pendientes', customize: 'Personalizar',
    signIn: 'Iniciar Sesión', signUp: 'Registrarse', email: 'Correo', password: 'Contraseña', fullName: 'Nombre Completo',
    school: 'Escuela / Universidad', forgotPassword: '¿Olvidó contraseña?', createAccount: 'Crear Cuenta',
    addTask: 'Añadir Tarea', newTask: 'Nueva Tarea', title: 'Título', description: 'Descripción',
    priority: 'Prioridad', status: 'Estado', dueDate: 'Fecha Límite', overdue: 'Atrasado',
    toDo: 'Por Hacer', inProgress: 'En Progreso', done: 'Hecho',
    low: 'Bajo', normal: 'Normal', high: 'Alto',
    addLog: 'Registrar', date: 'Fecha', timeIn: 'Hora Entrada', timeOut: 'Hora Salida',
    breakMinutes: 'Descanso', hoursWorked: 'Horas', mood: 'Ánimo',
    language: 'Idioma',
  },
}

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'fil', label: 'Filipino' },
  { code: 'es', label: 'Español' },
]

const I18nCtx = createContext()

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'en')

  const setLang = useCallback((code) => {
    setLangState(code)
    localStorage.setItem('lang', code)
  }, [])

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations.en?.[key] || key
  }, [lang])

  return (
    <I18nCtx.Provider value={{ lang, setLang, t, LANGS }}>
      {children}
    </I18nCtx.Provider>
  )
}

export function useI18n() {
  return useContext(I18nCtx)
}
