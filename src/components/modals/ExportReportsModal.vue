<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">download</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface">Export Reports</h3>
          <p class="text-body-sm text-on-surface-variant mt-0.5">Select reports to export as PDF</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-3">
      <div v-if="reportsStore.items.length === 0" class="flex flex-col items-center justify-center py-12 text-on-surface-variant">
        <span class="material-symbols-outlined text-[40px] mb-3">summarize</span>
        <p class="text-body-sm font-body-sm">No reports available to export.</p>
      </div>

      <div v-for="item in reportsStore.items" :key="item.id"
        class="flex items-center gap-3 p-3 rounded-lg border border-outline-variant cursor-pointer hover:bg-surface-container transition-colors"
        :class="{ 'border-primary bg-primary-container/20': selectedIds.has(item.id) }"
        @click="toggleSelect(item.id)">
        <input type="checkbox" :checked="selectedIds.has(item.id)" @click.stop="toggleSelect(item.id)"
          class="rounded border-outline-variant text-primary focus:ring-primary shrink-0" />
        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="iconBg(item.icon)">
          <span class="material-symbols-outlined text-on-primary" style="font-size:18px">{{ item.icon || 'summarize' }}</span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-body-sm font-bold text-on-surface truncate">{{ item.title }}</p>
          <p class="text-label-xs text-on-surface-variant truncate">{{ item.reportId }} · {{ item.type }} · {{ item.status }}</p>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between px-6 py-4 border-t border-outline-variant shrink-0 bg-surface-container-lowest">
      <span class="text-label-sm text-on-surface-variant">{{ selectedIds.size }} of {{ reportsStore.items.length }} selected</span>
      <div class="flex gap-2">
        <button @click="selectAll" v-if="selectedIds.size < reportsStore.items.length"
          class="text-label-md font-label-md text-primary hover:text-primary-container transition-colors px-3 py-1.5">
          Select All
        </button>
        <button @click="deselectAll" v-if="selectedIds.size > 0"
          class="text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5">
          Clear
        </button>
        <button @click="exportPdf" :disabled="selectedIds.size === 0 || exporting"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-label-md font-label-md transition-colors shadow-sm"
          :class="selectedIds.size === 0 ? 'bg-surface-container text-on-surface-variant cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary-container'">
          <span v-if="exporting" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
          <span v-else class="material-symbols-outlined text-[18px]">picture_as_pdf</span>
          {{ exporting ? 'Generating…' : `Export as PDF${selectedIds.size > 1 ? ' (' + selectedIds.size + ')' : ''}` }}
        </button>
      </div>
    </div>

    <div ref="pdfContent" id="pdf-content" class="hidden">
      <div v-for="item in selectedReports" :key="item.id" class="pdf-report-page">
        <div class="pdf-header">
          <div class="pdf-header-title">{{ hospitalName }}</div>
          <div class="pdf-header-sub">Enterprise Operations Report</div>
        </div>
        <div class="pdf-body">
          <div class="pdf-report-meta">
            <div class="pdf-meta-left">
              <div class="pdf-report-title">{{ item.title }}</div>
              <div class="pdf-report-id">{{ item.reportId }}</div>
            </div>
            <div class="pdf-meta-right">
              <div class="pdf-badge" :style="statusStyle(item.status)">{{ item.status }}</div>
              <div class="pdf-badge" :style="typeStyle(item.type)">{{ item.type }}</div>
            </div>
          </div>
          <div class="pdf-description" v-if="item.description" v-html="formatPDFText(item.description)"></div>

          <div class="pdf-section-title">Summary</div>
          <div class="pdf-stats-grid">
            <div class="pdf-stat-card">
              <div class="pdf-stat-label">Created By</div>
              <div class="pdf-stat-value">{{ item.createdByName || item.createdBy || '—' }}</div>
            </div>
            <div class="pdf-stat-card">
              <div class="pdf-stat-label">Created Date</div>
              <div class="pdf-stat-value">{{ item.createdAt ? formatDatePDF(item.createdAt) : '—' }}</div>
            </div>
            <div class="pdf-stat-card">
              <div class="pdf-stat-label">Report Type</div>
              <div class="pdf-stat-value">{{ item.type }}</div>
            </div>
            <div class="pdf-stat-card">
              <div class="pdf-stat-label">Status</div>
              <div class="pdf-stat-value">{{ item.status }}</div>
            </div>
          </div>

          <div class="pdf-section-title">Data Summary</div>
          <table class="pdf-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Records ({{ item.type }})</td>
                <td>{{ dataCounts[item.id] ?? '—' }}</td>
              </tr>
              <tr>
                <td>Generated On</td>
                <td>{{ generatedOn }}</td>
              </tr>
              <tr>
                <td>Generated By</td>
                <td>{{ generatedBy }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pdf-footer">
          {{ hospitalName }} · Confidential · Generated {{ generatedOn }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useReportsStore } from '@/stores/reports'
import { db, auth } from '@/lib/firebase'
import { useSettings } from '@/composables/useSettings'
import { collection, getDocs, query, limit } from 'firebase/firestore'

const emit = defineEmits(['close'])
const ui = useUIStore()
const reportsStore = useReportsStore()
const { hospitalName } = useSettings()

const selectedIds = ref(new Set())
const exporting = ref(false)
const dataCounts = ref({})
const generatedOn = ref('')
const generatedBy = ref('')
const pdfContent = ref(null)

const selectedReports = computed(() =>
  reportsStore.items.filter(item => selectedIds.value.has(item.id))
)

const collectionMap = {
  Tickets: 'tickets',
  Inventory: 'inventory',
  Maintenance: 'maintenanceTasks',
  Equipment: 'equipment',
  Procurement: 'purchaseOrders'
}

function toggleSelect(id) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  selectedIds.value = s
}

function selectAll() {
  selectedIds.value = new Set(reportsStore.items.map(i => i.id))
}

function deselectAll() {
  selectedIds.value = new Set()
}

function iconBg(icon) {
  const map = {
    bar_chart: 'bg-primary', pie_chart: 'bg-tertiary', show_chart: 'bg-secondary',
    table_chart: 'bg-cyan-600', summarize: 'bg-surface-variant text-on-surface',
    assessment: 'bg-amber-600', dashboard: 'bg-purple-600', analytics: 'bg-orange-600'
  }
  return map[icon] || 'bg-primary'
}

function formatPDFText(text) {
  if (!text) return ''
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const withParas = escaped.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
  return withParas
}

function formatDatePDF(val) {
  if (!val) return '—'
  if (val?.toDate) return val.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const d = new Date(val)
  return isNaN(d.getTime()) ? val : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function statusStyle(s) {
  if (s === 'Active') return 'background:#dcfce7;color:#166534'
  if (s === 'Draft') return 'background:#fef3c7;color:#92400e'
  return 'background:#f1f5f9;color:#475569'
}

function typeStyle(t) {
  const map = { Tickets: 'background:#e0e7ff;color:#4338ca', Inventory: 'background:#f1f5f9;color:#475569', Maintenance: 'background:#fef3c7;color:#92400e', Equipment: 'background:#e0e7ff;color:#6d28d9', Procurement: 'background:#e0e7ff;color:#0f766e' }
  return map[t] || 'background:#f1f5f9;color:#475569'
}

async function fetchDataCount(report) {
  const collName = collectionMap[report.type]
  if (!collName) return '—'
  try {
    const q = query(collection(db, collName), limit(1000))
    const snap = await getDocs(q)
    return String(snap.size)
  } catch {
    return '—'
  }
}

async function exportPdf() {
  if (selectedIds.value.size === 0 || exporting.value) return
  exporting.value = true
  generatedOn.value = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  generatedBy.value = auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown'

  const counts = {}
  const promises = selectedReports.value.map(async item => {
    counts[item.id] = await fetchDataCount(item)
  })
  await Promise.all(promises)
  dataCounts.value = counts

  await new Promise(resolve => setTimeout(resolve, 100))

  const el = document.getElementById('pdf-content')
  if (!el) { exporting.value = false; return }

  el.classList.remove('hidden')

  try {
    const html2pdf = (await import('html2pdf.js')).default
    const opt = {
      margin: [10, 10],
      filename: selectedReports.value.length === 1
        ? `report-${selectedReports.value[0].reportId || selectedReports.value[0].id}.pdf`
        : `reports-export-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }
    await html2pdf().set(opt).from(el).save()
  } catch (err) {
    console.error('PDF export failed:', err)
  } finally {
    el.classList.add('hidden')
    exporting.value = false
  }
}
</script>

<style scoped>
.pdf-report-page {
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  color: #1c1b1f;
  padding: 0;
  margin: 0;
  page-break-after: always;
}
.pdf-header {
  background: #1a73e8;
  color: #fff;
  padding: 28px 32px;
  border-radius: 8px 8px 0 0;
}
.pdf-header-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
}
.pdf-header-sub {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 4px;
}
.pdf-body {
  padding: 24px 32px;
}
.pdf-report-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.pdf-meta-left {
  flex: 1;
}
.pdf-report-title {
  font-size: 20px;
  font-weight: 700;
  color: #1c1b1f;
}
.pdf-report-id {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}
.pdf-meta-right {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.pdf-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
}
.pdf-description {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #1a73e8;
}
.pdf-description p {
  margin: 0 0 8px 0;
}
.pdf-description p:last-child {
  margin-bottom: 0;
}
.pdf-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1c1b1f;
  margin-bottom: 10px;
  margin-top: 20px;
  padding-bottom: 6px;
  border-bottom: 2px solid #e5e7eb;
}
.pdf-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 8px;
}
.pdf-stat-card {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.pdf-stat-label {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pdf-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1c1b1f;
  margin-top: 4px;
}
.pdf-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}
.pdf-table th {
  background: #f3f4f6;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  text-align: left;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pdf-table td {
  font-size: 13px;
  color: #1c1b1f;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
}
.pdf-footer {
  text-align: center;
  font-size: 10px;
  color: #9ca3af;
  padding: 12px 32px;
  border-top: 1px solid #e5e7eb;
  margin-top: 12px;
}
</style>
