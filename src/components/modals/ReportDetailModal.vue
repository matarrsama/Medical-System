<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant dark:border-outline shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">summarize</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface dark:text-inverse-on-surface">{{ editing ? 'Edit Report' : 'Report Details' }}</h3>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">{{ report.reportId }}</p>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button @click="toggleExpanded" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors" :title="ui.modalExpanded ? 'Collapse' : 'Expand'">
          <span class="material-symbols-outlined text-[20px]">{{ ui.modalExpanded ? 'collapse_content' : 'expand_content' }}</span>
        </button>
        <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-xl bg-surface-container dark:bg-white/[0.08] flex items-center justify-center text-primary">
          <span class="material-symbols-outlined text-[28px]">{{ report.icon || 'summarize' }}</span>
        </div>
        <div class="min-w-0 flex-1">
          <template v-if="editing">
            <input v-model="editForm.title" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-headline-sm font-headline-md bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <h2 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">{{ report.title }}</h2>
          </template>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">{{ report.reportId }}</p>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">Description</h4>
          <div class="flex items-center gap-2">
            <span :class="typeClass(report.type)" class="px-3 py-1 rounded text-label-sm font-label-sm">{{ report.type || '—' }}</span>
            <span :class="statusClass(report.status)" class="inline-flex items-center gap-1.5 px-3 py-1 rounded text-label-sm font-label-sm">
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(report.status)"></span>
              {{ report.status || '—' }}
            </span>
          </div>
        </div>
        <template v-if="editing">
          <textarea v-model="editForm.description" rows="6" class="w-full px-4 py-3 border border-outline-variant dark:border-outline rounded-xl text-body-md bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary resize-none" placeholder="Enter report description..."></textarea>
        </template>
        <template v-else>
          <div class="text-body-lg text-on-surface dark:text-inverse-on-surface bg-surface-container-low dark:bg-inverse-surface rounded-xl p-5 whitespace-pre-wrap leading-relaxed min-h-[8rem] border border-outline-variant dark:border-outline/20">
            {{ report.description || 'No description provided.' }}
          </div>
        </template>
      </div>

      <div class="flex flex-wrap gap-x-8 gap-y-3 px-4 py-3 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
        <div>
          <span class="text-label-xs text-outline font-medium uppercase tracking-wide">Icon</span>
          <p class="text-body-sm text-on-surface dark:text-inverse-on-surface font-medium mt-0.5 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[16px]">{{ report.icon || 'summarize' }}</span>
            {{ report.icon || 'summarize' }}
          </p>
        </div>
        <div>
          <span class="text-label-xs text-outline font-medium uppercase tracking-wide">Created</span>
          <p class="text-body-sm text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ formatDate(report.created) }}</p>
        </div>
        <div>
          <span class="text-label-xs text-outline font-medium uppercase tracking-wide">Created by</span>
          <p class="text-body-sm text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ report.createdByName || report.createdBy || '—' }}</p>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant dark:border-outline shrink-0 bg-surface-container-low dark:bg-inverse-surface">
      <template v-if="editing">
        <button @click="cancelEdit" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher transition-colors">
          Cancel
        </button>
        <button @click="save" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span v-else class="material-symbols-outlined text-[18px]">save</span>
          Save Changes
        </button>
      </template>
      <template v-else>
        <button @click="deleteReport" class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-label-md text-error hover:bg-error-container/20 transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete</span>
          Delete
        </button>
        <button @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher transition-colors">
          Close
        </button>
        <button @click="exportPdf" :disabled="exporting" class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <span v-if="exporting" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
          <span v-else class="material-symbols-outlined text-[18px]">picture_as_pdf</span>
          {{ exporting ? 'Generating…' : 'Export PDF' }}
        </button>
        <button @click="startEdit" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm">
          <span class="material-symbols-outlined text-[18px]">edit</span>
          Edit
        </button>
      </template>
    </div>

    <div ref="pdfContent" id="report-pdf-content" class="hidden">
      <div class="pdf-report-page">
        <div class="pdf-header">
          <div class="pdf-header-title">{{ hospitalName }}</div>
          <div class="pdf-header-sub">Enterprise Operations Report</div>
        </div>
        <div class="pdf-body">
          <div class="pdf-report-meta">
            <div class="pdf-meta-left">
              <div class="pdf-report-title">{{ report.title }}</div>
              <div class="pdf-report-id">{{ report.reportId }}</div>
            </div>
            <div class="pdf-meta-right">
              <div class="pdf-badge" :style="statusStyle(report.status)">{{ report.status }}</div>
              <div class="pdf-badge" :style="typeStyle(report.type)">{{ report.type }}</div>
            </div>
          </div>
          <div class="pdf-description" v-if="report.description" v-html="formatPDFText(report.description)"></div>

          <div class="pdf-section-title">Summary</div>
          <div class="pdf-stats-grid">
            <div class="pdf-stat-card">
              <div class="pdf-stat-label">Created By</div>
              <div class="pdf-stat-value">{{ report.createdByName || report.createdBy || '—' }}</div>
            </div>
            <div class="pdf-stat-card">
              <div class="pdf-stat-label">Created Date</div>
              <div class="pdf-stat-value">{{ formatDatePDF(report.created) }}</div>
            </div>
            <div class="pdf-stat-card">
              <div class="pdf-stat-label">Report Type</div>
              <div class="pdf-stat-value">{{ report.type }}</div>
            </div>
            <div class="pdf-stat-card">
              <div class="pdf-stat-label">Status</div>
              <div class="pdf-stat-value">{{ report.status }}</div>
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
                <td>Total Records ({{ report.type }})</td>
                <td>{{ dataCount }}</td>
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import { mapFirebaseError } from '@/utils/mapFirebaseError'
import { db, auth } from '@/lib/firebase'
import { useSettings } from '@/composables/useSettings'
import { doc, updateDoc, onSnapshot, collection, getDocs, query, limit } from 'firebase/firestore'

const ui = useUIStore()
const toast = useToast()
const { hospitalName } = useSettings()
const modalData = computed(() => ui.modalData || {})
const reportData = ref(modalData.value.report || modalData.value)
const report = computed(() => reportData.value)
const editing = ref(modalData.value.startEdit === true)
const saving = ref(false)
let unsub = null

const editForm = reactive({
  title: '', description: '', type: 'Tickets', status: 'Active', icon: 'summarize'
})
const exporting = ref(false)
const dataCount = ref('—')
const generatedOn = ref('')
const generatedBy = ref('')
const pdfContent = ref(null)

function startEdit() {
  Object.assign(editForm, {
    title: report.value.title || '',
    description: report.value.description || '',
    type: report.value.type || 'Tickets',
    status: report.value.status || 'Active',
    icon: report.value.icon || 'summarize'
  })
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function save() {
  if (!editForm.title.trim()) return
  saving.value = true
  try {
    await updateDoc(doc(db, 'reports', report.value.id), {
      title: editForm.title,
      description: editForm.description,
      type: editForm.type,
      status: editForm.status,
      icon: editForm.icon
    })
    await logActivity({ action: 'Update', resource: `Report ${report.value.reportId || report.value.id}`, details: `Updated "${editForm.title}"` })
    toast.success(`Report ${editForm.title} updated successfully!`)
    editing.value = false
  } catch (err) {
    console.error('[ReportDetailModal] error updating report:', err)
    toast.error(mapFirebaseError(err, 'Failed to update report.'))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const id = reportData.value?.id
  if (id) {
    unsub = onSnapshot(doc(db, 'reports', id), (snap) => {
      if (snap.exists()) {
        reportData.value = { id: snap.id, reportId: snap.data().reportId || snap.id, ...snap.data() }
      }
    })
  }
  if (modalData.value.startEdit === true) startEdit()
})

onUnmounted(() => {
  if (unsub) unsub()
})

function toggleExpanded() {
  ui.modalExpanded = !ui.modalExpanded
}

function deleteReport() {
  ui.closeModal()
  ui.openModal('DeleteConfirm', reportData.value)
}

const collectionMap = {
  Tickets: 'tickets', Inventory: 'inventory', Maintenance: 'maintenanceTasks',
  Equipment: 'equipment', Procurement: 'purchaseOrders'
}

async function fetchDataCount() {
  const collName = collectionMap[report.value.type]
  if (!collName) return '—'
  try {
    const q = query(collection(db, collName), limit(1000))
    const snap = await getDocs(q)
    return String(snap.size)
  } catch { return '—' }
}

async function exportPdf() {
  if (exporting.value) return
  exporting.value = true
  generatedOn.value = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  generatedBy.value = auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown'
  dataCount.value = await fetchDataCount()

  await new Promise(resolve => setTimeout(resolve, 100))

  const el = document.getElementById('report-pdf-content')
  if (!el) { exporting.value = false; return }
  el.classList.remove('hidden')

  try {
    const html2pdf = (await import('html2pdf.js')).default
    const opt = {
      margin: [10, 10],
      filename: `report-${report.value.reportId || report.value.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    await html2pdf().set(opt).from(el).save()
  } catch (err) {
    console.error('PDF export failed:', err)
  } finally {
    el.classList.add('hidden')
    exporting.value = false
  }
}

function formatPDFText(text) {
  if (!text) return ''
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const withParas = escaped.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
  return withParas
}

function formatDatePDF(v) {
  if (!v) return '—'
  if (v?.toDate) return v.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const d = new Date(v)
  return isNaN(d.getTime()) ? v : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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

function formatDate(v) {
  if (!v) return ''
  if (v?.toDate) return v.toDate().toLocaleString()
  return String(v)
}

function typeClass(t) {
  const map = { Tickets: 'bg-primary-container/30 text-primary dark:bg-primary-container/40 dark:text-inverse-primary', Inventory: 'bg-surface-container-highest text-on-surface-variant dark:text-outline', Maintenance: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200', Equipment: 'bg-tertiary-container/20 text-tertiary', Procurement: 'bg-secondary-container/30 text-secondary', Custom: 'bg-surface-container text-on-surface-variant dark:text-outline' }
  return map[t] || ''
}

function statusClass(s) {
  const map = { Active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200', Draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200', Archived: 'bg-surface-container-highest text-on-surface-variant dark:text-outline' }
  return map[s] || ''
}

function statusDot(s) {
  const map = { Active: 'bg-green-600', Draft: 'bg-amber-500', Archived: 'bg-on-surface-variant/50' }
  return map[s] || ''
}
</script>

<style>
.pdf-report-page {
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  color: #1c1b1f;
  padding: 0;
  margin: 0;
}
.pdf-header {
  background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
  color: #fff;
  padding: 32px 36px;
}
.pdf-header-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.pdf-header-sub {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 4px;
  font-weight: 400;
}
.pdf-body {
  padding: 28px 36px;
}
.pdf-report-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.pdf-meta-left {
  flex: 1;
}
.pdf-report-title {
  font-size: 22px;
  font-weight: 700;
  color: #1c1b1f;
  line-height: 1.3;
}
.pdf-report-id {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}
.pdf-meta-right {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.pdf-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
}
.pdf-description {
  font-size: 13px;
  color: #374151;
  line-height: 1.7;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #1a73e8;
}
.pdf-description p {
  margin: 0 0 8px 0;
}
.pdf-description p:last-child {
  margin-bottom: 0;
}
.pdf-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a73e8;
  margin-bottom: 12px;
  margin-top: 24px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.pdf-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 8px;
}
.pdf-stat-card {
  background: #ffffff;
  padding: 14px 18px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.pdf-stat-label {
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.pdf-stat-value {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin-top: 4px;
}
.pdf-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
}
.pdf-table th {
  background: #f1f5f9;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  text-align: left;
  padding: 10px 14px;
  border-bottom: 2px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pdf-table td {
  font-size: 13px;
  color: #1e293b;
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;
}
.pdf-table tbody tr:last-child td {
  border-bottom: none;
}
.pdf-footer {
  text-align: center;
  font-size: 9px;
  color: #94a3b8;
  padding: 16px 36px;
  border-top: 1px solid #e5e7eb;
  margin-top: 16px;
}
</style>
