<template>
  <div>
    <!-- 필터링 -->
    <VRow>
      <VCol cols="12" md="4">
        <VSelect
          v-model="selectedUniqueCode"
          label="고유번호로 필터링"
          :items="uniqueCodeOptions"
          variant="outlined"
          clearable
          hide-details
        />
      </VCol>
    </VRow>

    <!-- 연결 정보 -->
    <div v-if="filteredCodes.length === 0" class="d-flex justify-center align-center pa-16">
      <VIcon icon="ri-information-line" color="grey" size="24" class="mr-2" />
      <span class="text-grey">표시할 데이터가 없습니다.</span>
    </div>
    
    <div v-else class="mt-4">
      <!-- 고유번호 카드 목록 -->
      <div v-for="code in filteredCodes" :key="code.id" class="connection-card mb-8">
        <!-- 고유번호 정보 -->
        <div class="card-header">
          <div class="d-flex align-center">
            <VIcon icon="ri-key-line" color="secondary" size="24" class="mr-2" />
            <h3 class="text-h6">{{ code.title }}</h3>
          </div>
          <VChip
            size="small"
            color="secondary"
            variant="tonal"
          >
            고유번호 #{{ code.id }}
          </VChip>
        </div>

        <!-- 연결된 티켓과 일정 -->
        <div class="connection-details">
          <!-- 연결된 티켓 섹션 -->
          <div class="section-header">
            <div class="section-title">
              <VIcon icon="ri-ticket-line" color="primary" size="20" class="mr-2" />
              <span>연결된 티켓</span>
            </div>
            <VBtn
              variant="text"
              color="primary"
              size="small"
              prepend-icon="ri-add-line"
              @click="openTicketDialog(code)"
            >
              티켓 추가
            </VBtn>
          </div>
          <div class="connected-items">
            <div 
              v-for="ticket in getTicketsByCodeId(code.id)" 
              :key="ticket.id"
              class="ticket-item"
            >
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <div class="ticket-title">{{ ticket.title }}</div>
                  <VChip
                    size="x-small"
                    color="secondary"
                    variant="tonal"
                    class="ml-2"
                  >
                    {{ ticket.type }}
                  </VChip>
                </div>
                <VBtn
                  variant="text"
                  color="secondary"
                  size="x-small"
                  @click="removeTicketConnection(ticket, code)"
                >
                  제거
                </VBtn>
              </div>
              <div class="ticket-details text-caption">
                <span>{{ formatPrice(ticket.price) }}</span>
                <span class="mx-2">•</span>
                <span>{{ 
                  ticket.type === '횟수제' 
                    ? `${ticket.usageCount?.total}회` 
                    : `${ticket.validityPeriod.type}`
                }}</span>
              </div>
            </div>
          </div>

          <!-- 연결된 일정 섹션 -->
          <div class="section-header mt-4">
            <div class="section-title">
              <VIcon icon="ri-calendar-line" color="primary" size="20" class="mr-2" />
              <span>연결된 일정</span>
            </div>
            <VBtn
              variant="text"
              color="primary"
              size="small"
              prepend-icon="ri-add-line"
              @click="openScheduleDialog(code)"
            >
              일정 추가
            </VBtn>
          </div>
          <div class="connected-items">
            <div 
              v-for="schedule in getSchedulesByCodeId(code.id)" 
              :key="schedule.id"
              class="schedule-item"
            >
              <div class="d-flex justify-space-between align-center">
                <div class="schedule-title">{{ schedule.title }}</div>
                <VBtn
                  variant="text"
                  color="secondary"
                  size="x-small"
                  @click="removeScheduleConnection(schedule, code)"
                >
                  제거
                </VBtn>
              </div>
              <div class="schedule-details text-caption">
                <div>{{ formatDateRange(schedule.startDate, schedule.endDate) }}</div>
                <div class="mt-1">
                  <template v-if="schedule.timeType === 'custom'">
                    {{ schedule.startTime }} ~ {{ schedule.endTime }}
                  </template>
                  <template v-else>
                    하루종일
                  </template>
                  <template v-if="schedule.instructor">
                    <span class="mx-2">•</span>
                    <span>{{ schedule.instructor }}</span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 티켓 선택 다이얼로그 -->
    <VDialog v-model="ticketDialog.show" max-width="600">
      <VCard>
        <VCardTitle class="pa-4">
          티켓 추가
          <VSpacer />
          <VBtn
            variant="text"
            icon="ri-close-line"
            size="small"
            @click="ticketDialog.show = false"
          />
        </VCardTitle>
        <VCardText class="pa-4">
          <VSelect
            v-model="ticketDialog.selectedIds"
            label="추가할 티켓 선택"
            :items="availableTickets"
            item-title="title"
            item-value="id"
            multiple
            chips
            variant="outlined"
            no-data-text="추가할 수 있는 티켓이 없습니다"
          />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="text"
            @click="ticketDialog.show = false"
          >
            취소
          </VBtn>
          <VBtn
            color="primary"
            variant="text"
            :disabled="!ticketDialog.selectedIds.length"
            @click="addTicketConnections"
          >
            추가
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- 일정 선택 다이얼로그 -->
    <VDialog v-model="scheduleDialog.show" max-width="600">
      <VCard>
        <VCardTitle class="pa-4">
          일정 추가
          <VSpacer />
          <VBtn
            variant="text"
            icon="ri-close-line"
            size="small"
            @click="scheduleDialog.show = false"
          />
        </VCardTitle>
        <VCardText class="pa-4">
          <VSelect
            v-model="scheduleDialog.selectedIds"
            label="추가할 일정 선택"
            :items="availableSchedules"
            item-title="title"
            item-value="id"
            multiple
            chips
            variant="outlined"
            no-data-text="추가할 수 있는 일정이 없습니다"
          />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="text"
            @click="scheduleDialog.show = false"
          >
            취소
          </VBtn>
          <VBtn
            color="primary"
            variant="text"
            :disabled="!scheduleDialog.selectedIds.length"
            @click="addScheduleConnections"
          >
            추가
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Ticket, Schedule, UniqueCode } from '~/types/membership'
import dayjs from 'dayjs'

// Composables
const { uniqueCodes, tickets, schedules, updateTicket, updateSchedule } = useMembership()

// 상태
const selectedUniqueCode = ref<number | null>(null)

// 티켓 다이얼로그 상태
const ticketDialog = ref({
  show: false,
  selectedIds: [] as number[],
  targetCode: null as UniqueCode | null
})

// 일정 다이얼로그 상태
const scheduleDialog = ref({
  show: false,
  selectedIds: [] as number[],
  targetCode: null as UniqueCode | null
})

// 계산된 속성
const uniqueCodeOptions = computed(() => {
  return uniqueCodes.value.map((code: UniqueCode) => ({
    title: code.title,
    value: code.id
  }))
})

const filteredCodes = computed(() => {
  if (selectedUniqueCode.value) {
    return uniqueCodes.value.filter(code => 
      code.id === selectedUniqueCode.value
    )
  }
  return uniqueCodes.value
})

const availableTickets = computed(() => {
  if (!ticketDialog.value.targetCode) return []
  const connectedTickets = getTicketsByCodeId(ticketDialog.value.targetCode.id)
  return tickets.value.filter(ticket => 
    !connectedTickets.some(t => t.id === ticket.id)
  )
})

const availableSchedules = computed(() => {
  if (!scheduleDialog.value.targetCode) return []
  const connectedSchedules = getSchedulesByCodeId(scheduleDialog.value.targetCode.id)
  return schedules.value.filter(schedule => 
    !connectedSchedules.some(s => s.id === schedule.id)
  )
})

// Methods
const getTicketsByCodeId = (codeId: number) => {
  return tickets.value.filter(ticket => 
    ticket.uniqueCodeIds.includes(codeId)
  )
}

const getSchedulesByCodeId = (codeId: number) => {
  return schedules.value.filter(schedule => 
    schedule.uniqueCodeIds.includes(codeId)
  )
}

const formatDateRange = (startDate: string, endDate: string) => {
  return `${dayjs(startDate).format('YYYY.MM.DD')} ~ ${dayjs(endDate).format('YYYY.MM.DD')}`
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(price)
}

// 티켓 연결 관리
const openTicketDialog = (code: UniqueCode) => {
  ticketDialog.value = {
    show: true,
    selectedIds: [],
    targetCode: code
  }
}

const addTicketConnections = async () => {
  if (!ticketDialog.value.targetCode) return

  const codeId = ticketDialog.value.targetCode.id
  const selectedTickets = tickets.value.filter(t => 
    ticketDialog.value.selectedIds.includes(t.id)
  )

  // 각 티켓에 고유번호 추가
  for (const ticket of selectedTickets) {
    await updateTicket({
      ...ticket,
      uniqueCodeIds: [...ticket.uniqueCodeIds, codeId]
    })
  }

  ticketDialog.value.show = false
}

const removeTicketConnection = async (ticket: Ticket, code: UniqueCode) => {
  await updateTicket({
    ...ticket,
    uniqueCodeIds: ticket.uniqueCodeIds.filter(id => id !== code.id)
  })
}

// 일정 연결 관리
const openScheduleDialog = (code: UniqueCode) => {
  scheduleDialog.value = {
    show: true,
    selectedIds: [],
    targetCode: code
  }
}

const addScheduleConnections = async () => {
  if (!scheduleDialog.value.targetCode) return

  const codeId = scheduleDialog.value.targetCode.id
  const selectedSchedules = schedules.value.filter(s => 
    scheduleDialog.value.selectedIds.includes(s.id)
  )

  // 각 일정에 고유번호 추가
  for (const schedule of selectedSchedules) {
    await updateSchedule({
      ...schedule,
      uniqueCodeIds: [...schedule.uniqueCodeIds, codeId]
    })
  }

  scheduleDialog.value.show = false
}

const removeScheduleConnection = async (schedule: Schedule, code: UniqueCode) => {
  await updateSchedule({
    ...schedule,
    uniqueCodeIds: schedule.uniqueCodeIds.filter(id => id !== code.id)
  })
}
</script>

<style scoped>
.connection-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 16px;
  background-color: rgb(var(--v-theme-secondary-25));
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.connection-details {
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.connected-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 28px;
}

.ticket-item, .schedule-item {
  padding: 12px;
  background-color: rgb(var(--v-theme-primary-25));
  border-radius: 6px;
}

.ticket-title, .schedule-title {
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
}

.ticket-details, .schedule-details {
  margin-top: 4px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
</style> 