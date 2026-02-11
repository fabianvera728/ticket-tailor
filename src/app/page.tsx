"use client";

import { useState, useEffect } from "react";
import { 
  ClipboardCheck, 
  ClipboardCopy, 
  FileText, 
  Wand2, 
  PenTool, 
  CheckCircle2, 
  Settings2,
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { extractVariablesLocal, generateTicketLocal } from "@/lib/ticket-logic";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const DEFAULT_PROMPT = `# Role  
Eres un arquitecto de tickets técnicos que opera dentro del proceso de soporte y desarrollo en Odoo v15.  
Tu expertise está en estructurar requerimientos claros, trazables y accionables para equipos técnicos, traduciendo inquietudes de usuario en tickets de desarrollo bien formados y verificables.
 
# Task  
Genera el contenido para un **Ticket de Desarrollo estructurado**, incluyendo previamente un análisis de la inquietud del usuario en tres dimensiones:  
- Problema del cliente  
- Tarea específica  
- Resultado esperado  
 
# Context  
 
## Referencias del Sistema  
- **ERP:** Odoo v15  
- **Modelo principal:** res.partner (u otros que resulten pertinentes según la inquietud)  
- **Rol del autor del ticket:** Soporte Técnico / Contabilidad / Ingeniero de Software  
 
# Scope del Ticket  
- **Módulo/Feature:** {{MODULE_NAME}} (si aplica)  
- **Descripción breve:** {{BRIEF_DESCRIPTION}}  
- **Origen de la solicitud:** Inquietud del usuario  
 
# Instructions  
 
## 1. Descomposición obligatoria de la inquietud (Análisis previo)  
Antes de redactar el ticket, debes analizar y presentar explícitamente:
 
### 🔍 Descomposición de la Inquietud  
 
**Problema del cliente:**  
> (1–3 líneas describiendo la limitación o dificultad real que enfrenta el usuario en su operación en Odoo)
 
**Tarea específica:**  
> (Definición técnica precisa de qué debe hacerse en Odoo: modelo, campo, vista, dominio, regla, acción o configuración)
 
**Resultado esperado:**  
> (Cómo debería comportarse el sistema después del cambio desde la perspectiva funcional y operativa del usuario)
 
---
 
## 2. Estructura obligatoria del Ticket de Desarrollo  
 
A partir del análisis anterior, redacta el ticket con exactamente esta estructura y orden:
 
### 🎫 Ticket de Desarrollo  
 
#### 1) Contexto / Error  
Describir de forma concisa y objetiva:  
- Qué intenta hacer el usuario en Odoo.  
- Qué ocurre actualmente (comportamiento real del sistema, no el ideal).
 
#### 2) Requerimiento  
Definir el cambio técnico específico, mencionando cuando sea pertinente:  
- Modelo(s) afectados (p. ej., res.partner).  
- Elementos a modificar o agregar (campo, filtro, vista, dominio, regla de negocio, acción, etc.).  
- Ubicación del cambio (vista, menú, módulo, reporte, etc.), si aplica.
 
#### 3) Criterios de Aceptación (Checklist)  
Lista mínima y verificable de validaciones para considerar el ticket como resuelto, por ejemplo:  
- [ ] Criterio 1 (validación funcional o técnica concreta)  
- [ ] Criterio 2  
- [ ] Criterio 3  
 
---
 
## 3. Clasificación de restricciones  
 
### Hard Constraints (No negociables)  
Deben cumplirse obligatoriamente:  
- Coherencia con el modelo estándar de Odoo v15.  
- No inventar campos, módulos o configuraciones que el usuario no haya mencionado.  
- Respetar la semántica contable y comercial de Odoo (cliente/proveedor, ranks, dominios, etc.).  
- Mantener claridad técnica y trazabilidad del cambio solicitado.  
 
### Soft Constraints (Deseables)  
Deberían cumplirse cuando sea posible:  
- Uso de prácticas estándar de desarrollo en Odoo.  
- Claridad y precisión en la redacción técnica.  
- Minimizar cambios invasivos si existe una solución estándar de Odoo.  
 
---
 
## 4. Identificación de tensiones  
Si existen ambigüedades, contradicciones o posibles interpretaciones de la inquietud, menciónalas brevemente y base tu propuesta en la interpretación más razonable sin “alucinar” detalles.
 
---
 
# Output Format  
 
El output final debe contener dos secciones claramente diferenciadas:
 
1) **Descomposición de la Inquietud (Problema — Tarea — Resultado)**  
2) **Ticket de Desarrollo estructurado (Contexto/Error, Requerimiento, Criterios de Aceptación)**  
 
Sin introducciones ni despedidas.`;

export default function TicketTailor() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [variables, setVariables] = useState<string[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [completedTicket, setCompletedTicket] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const { toast } = useToast();

  const handleAnalyzePrompt = () => {
    if (!prompt.trim()) {
      toast({ title: "Plantilla vacía", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    
    // Extracción local con Regex
    const foundVariables = extractVariablesLocal(prompt);
    setVariables(foundVariables);
    
    const initialValues: Record<string, string> = {};
    foundVariables.forEach(v => {
      initialValues[v] = variableValues[v] || "";
    });
    setVariableValues(initialValues);
    
    setIsAnalyzing(false);
    toast({ title: "Análisis completo", description: `Se encontraron ${foundVariables.length} parámetros.` });
  };

  const handleGenerateTicket = () => {
    const unfilled = variables.filter(v => !variableValues[v]?.trim());
    if (unfilled.length > 0) {
      toast({ 
        title: "Falta información", 
        description: `Por favor completa: ${unfilled.join(", ")}`,
        variant: "destructive" 
      });
      return;
    }

    setIsGenerating(true);
    // Simulación de carga mínima para feedback visual
    setTimeout(() => {
      const result = generateTicketLocal(prompt, variableValues);
      setCompletedTicket(result);
      setIsGenerating(false);
      toast({ title: "Ticket generado correctamente" });
    }, 300);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(completedTicket);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copiado al portapapeles" });
    } catch (err) {
      toast({ title: "Error al copiar", variant: "destructive" });
    }
  };

  useEffect(() => {
    handleAnalyzePrompt();
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-2">
            <PenTool className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline">Ticket Tailor</h1>
          <p className="text-muted-foreground text-lg">
            Generador de requerimientos técnicos estructurados.
          </p>
        </div>

        {/* Prompt Configuration */}
        <Card className="shadow-md border-muted/50 overflow-hidden">
          <CardHeader 
            className="cursor-pointer hover:bg-muted/30 transition-colors flex flex-row items-center justify-between"
            onClick={() => setShowPromptEditor(!showPromptEditor)}
          >
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings2 className="w-5 h-5 text-primary" />
                Plantilla del Prompt
              </CardTitle>
              <CardDescription>
                Configura el diseño de tus tickets usando {"{{VARIABLES}}"}.
              </CardDescription>
            </div>
            {showPromptEditor ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </CardHeader>
          
          {showPromptEditor && (
            <CardContent className="space-y-4 pt-4 animate-in slide-in-from-top-4 duration-300">
              <Textarea
                placeholder="Pega tu prompt con {{NOMBRE_VARIABLE}} aquí..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[200px] font-mono text-sm border-muted"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleAnalyzePrompt} 
                  disabled={isAnalyzing}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isAnalyzing ? "Analizando..." : "Actualizar Parámetros"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPrompt(DEFAULT_PROMPT);
                    setTimeout(handleAnalyzePrompt, 10);
                  }}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  Restablecer
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                  onClick={() => { setPrompt(""); setVariables([]); }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Dynamic Form */}
        {variables.length > 0 && (
          <Card className="shadow-lg border-primary/20 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <PenTool className="w-5 h-5" />
                Parámetros Requeridos
              </CardTitle>
              <CardDescription>
                Ingresa los detalles específicos para este ticket.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                {variables.map((v) => (
                  <div key={v} className="space-y-2 group">
                    <Label htmlFor={v} className="text-sm font-semibold text-muted-foreground group-focus-within:text-primary transition-colors uppercase tracking-wider">
                      {v.replace(/_/g, " ")}
                    </Label>
                    <Input
                      id={v}
                      placeholder={`Ingresa ${v.toLowerCase()}...`}
                      value={variableValues[v] || ""}
                      onChange={(e) => setVariableValues({ ...variableValues, [v]: e.target.value })}
                      className="border-muted focus:border-primary focus:ring-1 focus:ring-primary h-12 text-base transition-all bg-muted/5 shadow-inner"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 py-6 border-t border-muted/50">
              <Button 
                onClick={handleGenerateTicket} 
                className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-md transform active:scale-[0.98] transition-all"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </div>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generar prompt
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Result Section */}
        {completedTicket && (
          <Card className="shadow-2xl border-accent/40 bg-accent/5 animate-in fade-in zoom-in duration-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-accent flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Contenido Generado
                </CardTitle>
                <CardDescription>
                  Tu ticket está listo para ser usado.
                </CardDescription>
              </div>
              <Button 
                onClick={handleCopy}
                className={`bg-accent hover:bg-accent/90 text-white shadow-md transition-all h-10 px-4 font-medium ${copied ? "bg-green-600 hover:bg-green-700" : ""}`}
              >
                {copied ? (
                  <>
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="w-4 h-4 mr-2" />
                    Copiar Resultado
                  </>
                )}
              </Button>
            </CardHeader>
            <Separator className="mx-6 opacity-20" />
            <CardContent className="pt-6">
              <div className="p-6 bg-white rounded-xl border border-accent/10 shadow-sm max-h-[600px] overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {completedTicket}
              </div>
            </CardContent>
            <CardFooter className="justify-center pb-8 opacity-60 italic text-xs flex gap-2 items-center">
              <FileText className="w-3 h-3" />
              Compatible con formato Markdown
            </CardFooter>
          </Card>
        )}

        {/* Footer info */}
        <div className="text-center pt-8 text-muted-foreground/40 text-sm">
          <p>© {new Date().getFullYear()} Ticket Tailor. Procesamiento 100% local y privado.</p>
        </div>
      </div>
    </div>
  );
}
