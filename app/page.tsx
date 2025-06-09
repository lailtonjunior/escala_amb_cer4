"use client" 

import React, { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Download, 
  Trash2, 
  Search, 
  Calendar,
  Users,
  BarChart3,
  FileText,
  Save,
  Copy,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Filter,
  X,
  Wand2,
  Eye
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AtendimentoRow {
  id: string
  nomeMedico: string
  especialidade: string
  diaSemana: string
  diasMes: string
  horaAtendimento: string
  qtdePrimeiraVez: string
  qtdeRetorno: string
  egresso: string
}

interface EscalaCompleta {
  id: string
  mesReferencia: string
  unidade: string
  atendimentos: AtendimentoRow[]
  createdAt: string
  updatedAt: string
}

interface TemplateData {
  medico: string
  especialidade: string
  diasMes: string
  horarios: string[]
  qtdePrimeiraVez: string
  qtdeRetorno: string
  egresso: string
}

interface PreviewLine {
  dia: number
  diaSemana: string
  horario: string
}

const medicosEspecialidades = {
  "ANA CAROLINA NUNES RIBEIRO": [
    "Grupo – Fonoaudiologia II",
    "Grupo – Reabilitação Auditiva",
    "BERA (Potencial Evocado Auditivo de Tronco Encefálico)",
  ],
  "DANIEL BRAZ NUNES AZEVEDO": ["Reabilitação em Pessoa com Deficiência Auditiva"],
  "JOSYANE BORGES DA SILVA GONÇALVES": ["Reabilitação em Pessoa com Deficiência Auditiva"],
  "IGOR MEDEIROS DOS SANTOS": ["Avaliação Paciente Ostomizado", "Consulta em Reabilitação Física"],
  "LEONARDO MACHADO XAVIER DE OLIVEIRA": ["Consulta em Reabilitação Intelectual / Autismo"],
  "DANIEL MEDLIG DE SOUSA CRAVO": ["Consulta em Reabilitação Visual I"],
  "CLAUDIO MEDLIG DE SOUSA CRAVO": ["Consulta em Reabilitação Física"],
}

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
}

// Componente Modal de Template
function TemplateModal({ isOpen, onClose, onGenerate, mesReferencia }: {
  isOpen: boolean
  onClose: () => void
  onGenerate: (linhas: AtendimentoRow[]) => void
  mesReferencia: string
}) {
  const [templateData, setTemplateData] = useState<TemplateData>({
    medico: '',
    especialidade: '',
    diasMes: '',
    horarios: [],
    qtdePrimeiraVez: '',
    qtdeRetorno: '',
    egresso: ''
  })

  const [showPreview, setShowPreview] = useState(false)

  // Função para calcular o dia da semana
  const calcularDiaSemana = (dia: number, mesAno: string): string => {
    if (!mesAno) return ''
    
    try {
      // Extrair mês e ano do formato "JUNHO/2025"
      const [mesNome, ano] = mesAno.split('/')
      const meses = {
        'JANEIRO': 0, 'FEVEREIRO': 1, 'MARÇO': 2, 'ABRIL': 3,
        'MAIO': 4, 'JUNHO': 5, 'JULHO': 6, 'AGOSTO': 7,
        'SETEMBRO': 8, 'OUTUBRO': 9, 'NOVEMBRO': 10, 'DEZEMBRO': 11
      }
      
      const mesNumero = meses[mesNome.toUpperCase() as keyof typeof meses]
      if (mesNumero === undefined) return ''
      
      const data = new Date(parseInt(ano), mesNumero, dia)
      const diasSemana = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']
      
      return diasSemana[data.getDay()]
    } catch {
      return ''
    }
  }

  // Gerar preview das linhas
  const linhasPreview = useMemo((): PreviewLine[] => {
    if (!templateData.diasMes || !templateData.horarios.length) return []
    
    const dias = templateData.diasMes.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d))
    const preview: PreviewLine[] = []
    
    dias.forEach(dia => {
      templateData.horarios.forEach(horario => {
        preview.push({
          dia,
          diaSemana: calcularDiaSemana(dia, mesReferencia),
          horario: horario === '08h' ? '08h00min' : '14h00min'
        })
      })
    })
    
    return preview.sort((a, b) => {
      if (a.dia !== b.dia) return a.dia - b.dia
      return a.horario.localeCompare(b.horario)
    })
  }, [templateData.diasMes, templateData.horarios, mesReferencia])

  // Gerar linhas do atendimento
  const gerarLinhas = () => {
    const linhas: AtendimentoRow[] = []
    
    linhasPreview.forEach((preview, index) => {
      linhas.push({
        id: `template-${Date.now()}-${index}`,
        nomeMedico: templateData.medico,
        especialidade: templateData.especialidade,
        diaSemana: preview.diaSemana,
        diasMes: preview.dia.toString(),
        horaAtendimento: preview.horario,
        qtdePrimeiraVez: templateData.qtdePrimeiraVez,
        qtdeRetorno: templateData.qtdeRetorno,
        egresso: templateData.egresso
      })
    })
    
    onGenerate(linhas)
    setTemplateData({
      medico: '',
      especialidade: '',
      diasMes: '',
      horarios: [],
      qtdePrimeiraVez: '',
      qtdeRetorno: '',
      egresso: ''
    })
    setShowPreview(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-purple-600" />
              Gerador de Template de Escala
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Médico *</Label>
                <Select
                  value={templateData.medico}
                  onValueChange={(value) => setTemplateData(prev => ({ ...prev, medico: value, especialidade: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(medicosEspecialidades).map((medico) => (
                      <SelectItem key={medico} value={medico}>
                        {medico}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Especialidade *</Label>
                <Select
                  value={templateData.especialidade}
                  onValueChange={(value) => setTemplateData(prev => ({ ...prev, especialidade: value }))}
                  disabled={!templateData.medico}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={templateData.medico ? "Selecionar especialidade" : "Selecione o médico primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {templateData.medico &&
                      medicosEspecialidades[templateData.medico as keyof typeof medicosEspecialidades]?.map(
                        (especialidade) => (
                          <SelectItem key={especialidade} value={especialidade}>
                            {especialidade}
                          </SelectItem>
                        ),
                      )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Dias do Mês *</Label>
                <Input
                  value={templateData.diasMes}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, diasMes: e.target.value }))}
                  placeholder="Ex: 7, 14, 21, 28"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Separe os dias por vírgula</p>
              </div>

              <div>
                <Label className="text-sm font-semibold">Horários *</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={templateData.horarios.includes('08h')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTemplateData(prev => ({ ...prev, horarios: [...prev.horarios, '08h'] }))
                        } else {
                          setTemplateData(prev => ({ ...prev, horarios: prev.horarios.filter(h => h !== '08h') }))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">08h00min (Manhã)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={templateData.horarios.includes('14h')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTemplateData(prev => ({ ...prev, horarios: [...prev.horarios, '14h'] }))
                        } else {
                          setTemplateData(prev => ({ ...prev, horarios: prev.horarios.filter(h => h !== '14h') }))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">14h00min (Tarde)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm font-semibold">Qtde 1ª Vez</Label>
                  <Input
                    value={templateData.qtdePrimeiraVez}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, qtdePrimeiraVez: e.target.value }))}
                    placeholder="8"
                    type="number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Qtde Retorno</Label>
                  <Input
                    value={templateData.qtdeRetorno}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, qtdeRetorno: e.target.value }))}
                    placeholder="12"
                    type="number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Egresso</Label>
                  <Input
                    value={templateData.egresso}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, egresso: e.target.value }))}
                    placeholder="2"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowPreview(true)}
                  disabled={!templateData.medico || !templateData.especialidade || !templateData.diasMes || !templateData.horarios.length}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Visualizar Preview
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Preview das Linhas</h3>
                {linhasPreview.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {linhasPreview.length} linha(s)
                  </span>
                )}
              </div>

              {!showPreview && linhasPreview.length === 0 && (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Preencha os campos ao lado para ver o preview</p>
                </div>
              )}

              {showPreview && linhasPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Mês de referência: {mesReferencia || 'Não informado'}
                    </div>
                    
                    <div className="space-y-2">
                      {linhasPreview.map((linha, index) => (
                        <div key={index} className="bg-white p-3 rounded border text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium">Dia:</span> {linha.dia} ({linha.diaSemana})
                            </div>
                            <div>
                              <span className="font-medium">Horário:</span> {linha.horario}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {templateData.medico} - {templateData.especialidade}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={gerarLinhas}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Gerar {linhasPreview.length} Linha(s)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(false)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              )}

              {!mesReferencia && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Defina o mês de referência na escala principal para calcular os dias da semana automaticamente.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook personalizado para localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

// Componente de Toast
function Toast({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }[toast.type]

  const iconColor = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }[toast.type]

  return (
    <div className={`p-4 rounded-lg border ${bgColor} shadow-lg max-w-sm`}>
      <div className="flex items-start gap-3">
        <CheckCircle className={`h-5 w-5 mt-0.5 ${iconColor}`} />
        <div className="flex-1">
          <h4 className="font-medium text-sm">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm text-gray-600 mt-1">{toast.description}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

const diasSemana = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"]

// Componente principal melhorado
export default function EscalaAmbulatoralMelhorada() {
  const [mesReferencia, setMesReferencia] = useState("")
  const [unidade, setUnidade] = useState("APAE DE COLINAS")
  const [escalas, setEscalas] = useLocalStorage<EscalaCompleta[]>('ceriv-escalas', [])
  const [escalaAtual, setEscalaAtual] = useState<string | null>(null)
  const [filtros, setFiltros] = useState({ medico: '', especialidade: '', mes: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  
  const [atendimentos, setAtendimentos] = useState<AtendimentoRow[]>([
    {
      id: "1",
      nomeMedico: "",
      especialidade: "",
      diaSemana: "",
      diasMes: "",
      horaAtendimento: "",
      qtdePrimeiraVez: "",
      qtdeRetorno: "",
      egresso: "",
    },
  ])

  // Função para adicionar toast
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }, [])

  // Função para gerar linhas do template
  const gerarLinhasTemplate = useCallback((novasLinhas: AtendimentoRow[]) => {
    setAtendimentos(prev => {
      // Remove a linha vazia inicial se existir
      const linhasLimpas = prev.filter(linha => 
        linha.nomeMedico || linha.especialidade || linha.diaSemana || 
        linha.diasMes || linha.horaAtendimento
      )
      return [...linhasLimpas, ...novasLinhas]
    })
    
    addToast({ 
      type: 'success', 
      title: 'Template Gerado', 
      description: `${novasLinhas.length} linhas foram adicionadas com sucesso` 
    })
  }, [addToast])

  // Função para remover toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Validação de formulário
  const validarFormulario = useCallback(() => {
    if (!mesReferencia.trim()) {
      addToast({ type: 'error', title: 'Erro de Validação', description: 'Mês de referência é obrigatório' })
      return false
    }
    
    if (!unidade.trim()) {
      addToast({ type: 'error', title: 'Erro de Validação', description: 'Unidade é obrigatória' })
      return false
    }

    const atendimentosValidos = atendimentos.filter(a => a.nomeMedico && a.especialidade)
    if (atendimentosValidos.length === 0) {
      addToast({ type: 'error', title: 'Erro de Validação', description: 'Pelo menos um atendimento válido é necessário' })
      return false
    }

    return true
  }, [mesReferencia, unidade, atendimentos, addToast])

  // Salvar escala
  const salvarEscala = useCallback(() => {
    if (!validarFormulario()) return

    setIsLoading(true)
    
    const escala: EscalaCompleta = {
      id: escalaAtual || Date.now().toString(),
      mesReferencia,
      unidade,
      atendimentos: atendimentos.filter(a => a.nomeMedico && a.especialidade),
      createdAt: escalaAtual ? escalas.find(e => e.id === escalaAtual)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (escalaAtual) {
      setEscalas(prev => prev.map(e => e.id === escalaAtual ? escala : e))
      addToast({ type: 'success', title: 'Escala Atualizada', description: 'A escala foi atualizada com sucesso' })
    } else {
      setEscalas(prev => [...prev, escala])
      addToast({ type: 'success', title: 'Escala Salva', description: 'Nova escala foi salva com sucesso' })
    }

    setIsLoading(false)
  }, [validarFormulario, escalaAtual, mesReferencia, unidade, atendimentos, escalas, setEscalas, addToast])

  // Carregar escala existente
  const carregarEscala = useCallback((id: string) => {
    const escala = escalas.find(e => e.id === id)
    if (escala) {
      setEscalaAtual(id)
      setMesReferencia(escala.mesReferencia)
      setUnidade(escala.unidade)
      setAtendimentos(escala.atendimentos)
      addToast({ type: 'info', title: 'Escala Carregada', description: `Escala de ${escala.mesReferencia} foi carregada` })
    }
  }, [escalas, addToast])

  // Nova escala
  const novaEscala = useCallback(() => {
    setEscalaAtual(null)
    setMesReferencia("")
    setUnidade("APAE DE COLINAS")
    setAtendimentos([{
      id: Date.now().toString(),
      nomeMedico: "",
      especialidade: "",
      diaSemana: "",
      diasMes: "",
      horaAtendimento: "",
      qtdePrimeiraVez: "",
      qtdeRetorno: "",
      egresso: "",
    }])
  }, [])

  // Duplicar escala
  const duplicarEscala = useCallback((id: string) => {
    const escala = escalas.find(e => e.id === id)
    if (escala) {
      setEscalaAtual(null)
      setMesReferencia("")
      setUnidade(escala.unidade)
      setAtendimentos(escala.atendimentos.map(a => ({ ...a, id: Math.random().toString(36).substr(2, 9) })))
      addToast({ type: 'info', title: 'Escala Duplicada', description: 'Escala foi duplicada. Altere o mês de referência.' })
    }
  }, [escalas, addToast])

  // Excluir escala
  const excluirEscala = useCallback((id: string) => {
    setEscalas(prev => prev.filter(e => e.id !== id))
    if (escalaAtual === id) {
      novaEscala()
    }
    addToast({ type: 'success', title: 'Escala Excluída', description: 'A escala foi excluída com sucesso' })
  }, [setEscalas, escalaAtual, novaEscala, addToast])

  const adicionarLinha = () => {
    const novaLinha: AtendimentoRow = {
      id: Date.now().toString(),
      nomeMedico: "",
      especialidade: "",
      diaSemana: "",
      diasMes: "",
      horaAtendimento: "",
      qtdePrimeiraVez: "",
      qtdeRetorno: "",
      egresso: "",
    }
    setAtendimentos([...atendimentos, novaLinha])
  }

  const removerLinha = (id: string) => {
    if (atendimentos.length > 1) {
      setAtendimentos(atendimentos.filter((item) => item.id !== id))
    }
  }

  const atualizarLinha = (id: string, campo: keyof AtendimentoRow, valor: string) => {
    setAtendimentos(atendimentos.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)))
  }

  const selecionarMedico = (id: string, nomeMedico: string) => {
    setAtendimentos(
      atendimentos.map((item) =>
        item.id === id
          ? { ...item, nomeMedico, especialidade: "" }
          : item,
      ),
    )
  }

  // Filtrar escalas
  const escalasFiltradas = useMemo(() => {
    return escalas.filter(escala => {
      if (filtros.medico && !escala.atendimentos.some(a => a.nomeMedico.includes(filtros.medico))) return false
      if (filtros.especialidade && !escala.atendimentos.some(a => a.especialidade.includes(filtros.especialidade))) return false
      if (filtros.mes && !escala.mesReferencia.toLowerCase().includes(filtros.mes.toLowerCase())) return false
      return true
    })
  }, [escalas, filtros])

  // Estatísticas
  const estatisticas = useMemo(() => ({
    totalEscalas: escalas.length,
    medicosUnicos: new Set(escalas.flatMap(e => e.atendimentos.map(a => a.nomeMedico))).size,
    especialidadesUnicas: new Set(escalas.flatMap(e => e.atendimentos.map(a => a.especialidade))).size,
    totalAtendimentos: escalas.reduce((acc, e) => acc + e.atendimentos.length, 0)
  }), [escalas])

  const exportarPDF = async () => {
    if (!validarFormulario()) return

    setIsLoading(true)
    try {
      const { jsPDF } = await import("jspdf")
      const { default: autoTable } = await import("jspdf-autotable")

      const doc = new jsPDF("landscape", "mm", "a4")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)

      const pageWidth = doc.internal.pageSize.getWidth()
      const titulo = "ESCALA AMBULATORIAL – REGULAÇÃO"
      const tituloWidth = doc.getTextWidth(titulo)
      doc.text(titulo, (pageWidth - tituloWidth) / 2, 20)

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`REFERENTE AO MÊS: ${mesReferencia}`, 20, 35)
      doc.text(`UNIDADE: ${unidade}`, 20, 45)

      const headers = [
        "NOME DO MÉDICO",
        "ESPECIALIDADE CONFORME CONFIG. SISREG",
        "DIA DA SEMANA",
        "DIA(S) DO MÊS",
        "HORA DO ATENDIMENTO",
        "QTDE 1ª VEZ",
        "QTDE RETORNO",
        "EGRESSO",
      ]

      const data = atendimentos
        .filter(item => item.nomeMedico && item.especialidade)
        .map((item) => [
          item.nomeMedico,
          item.especialidade,
          item.diaSemana,
          item.diasMes,
          item.horaAtendimento,
          item.qtdePrimeiraVez,
          item.qtdeRetorno,
          item.egresso,
        ])

      autoTable(doc, {
        head: [headers],
        body: data,
        startY: 55,
        styles: { fontSize: 9, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1 },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold", halign: "center" },
        bodyStyles: { textColor: [0, 0, 0], halign: "center" },
        columnStyles: {
          0: { cellWidth: 40, halign: "left" },
          1: { cellWidth: 50, halign: "left" },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 },
        },
        margin: { left: 20, right: 20 },
      })

      doc.save(`Escala_Ambulatorial_${mesReferencia.replace("/", "_")}.pdf`)
      addToast({ type: 'success', title: 'PDF Exportado', description: 'Arquivo PDF foi gerado com sucesso' })
    } catch (error) {
      addToast({ type: 'error', title: 'Erro na Exportação', description: 'Falha ao gerar o arquivo PDF' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Sistema de Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header com Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              SISTEMA CERIV - ESCALAS AMBULATORIAIS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Escalas</p>
                    <p className="text-2xl font-bold text-blue-600">{estatisticas.totalEscalas}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Médicos Únicos</p>
                    <p className="text-2xl font-bold text-green-600">{estatisticas.medicosUnicos}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Especialidades</p>
                    <p className="text-2xl font-bold text-purple-600">{estatisticas.especialidadesUnicas}</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Atendimentos</p>
                    <p className="text-2xl font-bold text-orange-600">{estatisticas.totalAtendimentos}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escalas Salvas */}
        {escalas.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Escalas Salvas</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <Input
                    placeholder="Filtrar por médico..."
                    value={filtros.medico}
                    onChange={(e) => setFiltros(prev => ({ ...prev, medico: e.target.value }))}
                  />
                  <Input
                    placeholder="Filtrar por especialidade..."
                    value={filtros.especialidade}
                    onChange={(e) => setFiltros(prev => ({ ...prev, especialidade: e.target.value }))}
                  />
                  <Input
                    placeholder="Filtrar por mês..."
                    value={filtros.mes}
                    onChange={(e) => setFiltros(prev => ({ ...prev, mes: e.target.value }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {escalasFiltradas.map((escala) => (
                  <div key={escala.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{escala.mesReferencia}</h3>
                        <p className="text-sm text-gray-600">{escala.unidade}</p>
                        <p className="text-xs text-gray-500">
                          {escala.atendimentos.length} atendimento(s)
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => carregarEscala(escala.id)}
                          className="h-8 w-8 p-0"
                          title="Carregar"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicarEscala(escala.id)}
                          className="h-8 w-8 p-0"
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirEscala(escala.id)}
                          className="h-8 w-8 p-0 text-red-500"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Criado: {new Date(escala.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário Principal */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {escalaAtual ? 'Editando Escala' : 'Nova Escala Ambulatorial'}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={novaEscala} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova
                </Button>
                <Button 
                  onClick={salvarEscala} 
                  size="sm" 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {escalaAtual && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você está editando uma escala existente. As alterações serão salvas automaticamente.
                </AlertDescription>
              </Alert>
            )}

            {/* Cabeçalho */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-100 rounded">
              <div>
                <Label htmlFor="mes" className="text-sm font-semibold">
                  REFERENTE AO MÊS: *
                </Label>
                <Input
                  id="mes"
                  value={mesReferencia}
                  onChange={(e) => setMesReferencia(e.target.value)}
                  placeholder="Ex: FEVEREIRO/2025"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="unidade" className="text-sm font-semibold">
                  UNIDADE: *
                </Label>
                <Input
                  id="unidade"
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  placeholder="Ex: APAE DE COLINAS"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-2 text-xs font-semibold text-left">NOME DO MÉDICO</th>
                    <th className="border border-gray-300 p-2 text-xs font-semibold text-left">
                      ESPECIALIDADE CONFORME CONFIG. SISREG
                    </th>
                    <th className="border border-gray-300 p-2 text-xs font-semibold">DIA DA SEMANA</th>
                    <th className="border border-gray-300 p-2 text-xs font-semibold">DIA(S) DO MÊS</th>
                    <th className="border border-gray-300 p-2 text-xs font-semibold">HORA DO ATENDIMENTO</th>
                    <th className="border border-gray-300 p-2 text-xs font-semibold">QTDE 1ª VEZ</th>
                    <th className="border border-gray-300 p-2 text-xs font-semibold">QTDE RETORNO</th>
                    <th className="border border-gray-300 p-2 text-xs font-semibold">EGRESSO</th>
                    <th className="border border-gray-300 p-2 text-xs font-semibold">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {atendimentos.map((atendimento) => (
                    <tr key={atendimento.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-1">
                        <Select
                          value={atendimento.nomeMedico}
                          onValueChange={(value) => selecionarMedico(atendimento.id, value)}
                        >
                          <SelectTrigger className="border-0 text-xs h-8">
                            <SelectValue placeholder="Selecionar médico" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(medicosEspecialidades).map((medico) => (
                              <SelectItem key={medico} value={medico} className="text-xs">
                                {medico}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Select
                          value={atendimento.especialidade}
                          onValueChange={(value) => atualizarLinha(atendimento.id, "especialidade", value)}
                          disabled={!atendimento.nomeMedico}
                        >
                          <SelectTrigger className="border-0 text-xs h-8">
                            <SelectValue
                              placeholder={
                                atendimento.nomeMedico ? "Selecionar especialidade" : "Selecione o médico primeiro"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {atendimento.nomeMedico &&
                              medicosEspecialidades[atendimento.nomeMedico as keyof typeof medicosEspecialidades]?.map(
                                (especialidade) => (
                                  <SelectItem key={especialidade} value={especialidade} className="text-xs">
                                    {especialidade}
                                  </SelectItem>
                                ),
                              )}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Select
                          value={atendimento.diaSemana}
                          onValueChange={(value) => atualizarLinha(atendimento.id, "diaSemana", value)}
                        >
                          <SelectTrigger className="border-0 text-xs h-8">
                            <SelectValue placeholder="Dia" />
                          </SelectTrigger>
                          <SelectContent>
                            {diasSemana.map((dia) => (
                              <SelectItem key={dia} value={dia} className="text-xs">
                                {dia}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={atendimento.diasMes}
                          onChange={(e) => atualizarLinha(atendimento.id, "diasMes", e.target.value)}
                          className="border-0 text-xs h-8"
                          placeholder="Ex: 4, 11"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={atendimento.horaAtendimento}
                          onChange={(e) => atualizarLinha(atendimento.id, "horaAtendimento", e.target.value)}
                          className="border-0 text-xs h-8"
                          placeholder="Ex: 13h30min"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={atendimento.qtdePrimeiraVez}
                          onChange={(e) => atualizarLinha(atendimento.id, "qtdePrimeiraVez", e.target.value)}
                          className="border-0 text-xs h-8"
                          placeholder="Qtde"
                          type="number"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={atendimento.qtdeRetorno}
                          onChange={(e) => atualizarLinha(atendimento.id, "qtdeRetorno", e.target.value)}
                          className="border-0 text-xs h-8"
                          placeholder="Qtde"
                          type="number"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={atendimento.egresso}
                          onChange={(e) => atualizarLinha(atendimento.id, "egresso", e.target.value)}
                          className="border-0 text-xs h-8"
                          placeholder="Egresso"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerLinha(atendimento.id)}
                          disabled={atendimentos.length === 1}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-wrap gap-4 mt-6">
              <Button onClick={adicionarLinha} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Linha
              </Button>

              <Button 
                onClick={() => setShowTemplateModal(true)} 
                variant="outline"
                className="flex items-center gap-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              >
                <Wand2 className="h-4 w-4" />
                Gerar Template
              </Button>

              <Button
                onClick={exportarPDF}
                variant="outline"
                className="flex items-center gap-2"
                disabled={!mesReferencia || !unidade || isLoading}
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Exportar PDF
              </Button>

              <Button
                onClick={salvarEscala}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {escalaAtual ? 'Atualizar' : 'Salvar'} Escala
              </Button>
            </div>

            {(!mesReferencia || !unidade) && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  * Preencha o mês de referência e a unidade para habilitar todas as funcionalidades
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Modal de Template */}
        <TemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onGenerate={gerarLinhasTemplate}
          mesReferencia={mesReferencia}
        />
      </div>
    </div>
  )
}