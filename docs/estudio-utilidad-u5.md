# U5 — Protocolo de validación de utilidad

26/11/2026. **Estudio preparado, no realizado. Cero participantes reclutados y
cero resultados reales registrados.** Las pruebas técnicas no validan demanda,
seguridad alimentaria, visitas, retención ni adecuación al mercado.

## Antes de comenzar

Autorizar reclutamiento de 10–15 adultos voluntarios, responsable de observación,
consentimiento y conservación. Usar cuentas sintéticas y backend QA aislado; no
pedir contraseña real, diagnóstico, historial médico, dirección personal ni GPS.
No grabar pantalla/voz ni exportar datos personales sin autorización específica.
La muestra es exploratoria y no representativa.

Propuesta de minimización: identificador aleatorio de sesión, tareas codificadas
y notas sin datos personales; conservar observaciones 30 días y después revisar
su eliminación. Esta política requiere aprobación, no está activa por defecto.

## Sesión de 20 minutos

No explicar la taxonomía antes de medir comprensión. Leer estas tareas sin guiar
qué botón debe pulsar la persona. Anotar ayuda necesaria, error crítico y motivo.

| Código | Tarea | Criterio observable |
| --- | --- | --- |
| city | Buscar un local en una ciudad indicada | Encuentra candidatos y reconoce la localidad |
| compare | Comparar dos ofertas para comer o comprar | Identifica oferta y datos desconocidos, sin tomar descuento por rating |
| source | Explicar la procedencia de una ficha | Distingue negocio, comunidad y fuente; no atribuye certificación a GlutenFri |
| contact | Encontrar menú, teléfono o indicaciones | Encuentra una acción o reconoce que no está disponible |
| empty | Resolver una búsqueda sin coincidencias | Distingue vacío de fallo y elimina filtros manteniendo la consulta |
| save | Guardar, abrir detalle y volver | Conserva contexto; comprueba guardado sin credenciales reales |
| report | Reportar un dato sintético incorrecto | Envía un reporte sin interpretar que modifica automáticamente la ficha |

Preguntas finales: ¿qué dato faltaba?, ¿por qué descartaste un candidato?, ¿qué
tuviste que comprobar fuera?, ¿qué entendiste por fuente revisada? Nunca preguntar
«¿te parece segura esta app?» como sustituto de una tarea de producto.

## Registro y análisis

`client/src/utils/utilityStudy.js` contiene una lista cerrada de tareas/eventos y
un resumidor puro. Cada observación codificada acepta `task`, `success`,
`understoodSource` y `seconds`. Devuelve intentos, éxitos, comprensión y mediana
por tarea. Sin observaciones, devuelve cero intentos y mediana nula; no inventa
porcentajes ni participantes. Las pruebas usan observaciones ficticias etiquetadas.

El esquema `studyEvent` admite únicamente tipo cerrado, intención cerrada y rango
de resultados. Descarta consultas libres, identificadores, emails, ubicación y
cualquier campo adicional. **No está conectado a la UI, no recoge eventos, no
persiste datos y no transmite nada.** Activar analítica real y decidir consentimiento,
retención y destino siguen requiriendo autorización separada; no se añade un SDK.

Umbral propuesto: 8 de 10 personas completan la tarea principal y explican fuente
y límites sin error crítico. Revisarlo antes de reclutar. Registrar siempre el
denominador, las ayudas y los abandonos; un clic en teléfono no acredita llamada
y un clic en indicaciones no acredita visita. Si falla comprensión, corregirla
antes de ampliar participantes o monetizar.
