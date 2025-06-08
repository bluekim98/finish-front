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
          <div class="section-title">
            <VIcon icon="ri-ticket-line" color="primary" size="20" class="mr-2" />
            <span>연결된 티켓</span>
          </div>
          <div class="connected-items">
            <div 
              v-for="ticket in getTicketsByCodeId(code.id)" 
              :key="ticket.id"
              class="ticket-item"
            >
              <div class="d-flex justify-space-between align-center">
                <div class="ticket-title">{{ ticket.title }}</div>
                <VChip
                  size="x-small"
                  :color="ticket.type === '횟수제' ? 'info' : 'success'"
                  variant="tonal"
                >
                  {{ ticket.type }}
                </VChip>
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
          <div class="section-title mt-4">
            <VIcon icon="ri-calendar-line" color="success" size="20" class="mr-2" />
            <span>연결된 일정</span>
          </div>
          <div class="connected-items">
            <div 
              v-for="schedule in getSchedulesByCodeId(code.id)" 
              :key="schedule.id"
              class="schedule-item"
            >
              <div class="schedule-title">{{ schedule.title }}</div>
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Ticket, Schedule, UniqueCode } from '~/types/membership'
import dayjs from 'dayjs'

// Composables
const { uniqueCodes, tickets, schedules } = useMembership()

// 상태
const selectedUniqueCode = ref<number | null>(null)

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

.section-title {
  display: flex;
  align-items: center;
  font-weight: 500;
  margin-bottom: 12px;
}

.connected-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 28px;
}

.ticket-item {
  padding: 12px;
  background-color: rgb(var(--v-theme-primary-25));
  border-radius: 6px;
}

.ticket-title {
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
}

.ticket-details {
  margin-top: 4px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.schedule-item {
  padding: 12px;
  background-color: rgb(var(--v-theme-success-25));
  border-radius: 6px;
}

.schedule-title {
  font-weight: 500;
  color: rgb(var(--v-theme-success));
}

.schedule-details {
  margin-top: 4px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
</style> 