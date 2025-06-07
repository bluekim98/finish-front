<template>
  <div class="ticket-tab">
    <!-- 액션 바 (고유번호 관리 탭 방식) -->
    <VRow class="mb-4 mt-1">
      <VCol cols="12" md="9"> <!-- 필터 영역 -->
        <VRow align="center">
          <VCol cols="12" md="4">
            <VTextField
              v-model="searchQuery"
              label="검색"
              placeholder="티켓명, 타입으로 검색"
              variant="outlined"
              density="compact"
              prepend-inner-icon="ri-search-line"
              clearable
              @keyup.enter="handleSearch"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect
              v-model="selectedType"
              label="타입"
              :items="ticketTypeOptions"
              variant="outlined"
              density="compact"
              clearable
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect
              v-model="selectedUniqueCode"
              label="고유번호"
              :items="uniqueCodeOptions"
              variant="outlined"
              density="compact"
              clearable
            />
          </VCol>
        </VRow>
      </VCol>
      <VCol cols="12" md="3" class="d-flex justify-end align-center"> <!-- 버튼 영역 -->
        <VBtn
          color="primary"
          variant="text"
          @click="openCreateModal"
          prepend-icon="ri-add-line"
        >
          티켓 추가
        </VBtn>
      </VCol>
    </VRow>

    <!-- 테이블 영역 -->
    <VCard>
      <VCardText class="pa-0">
        <VTable class="text-no-wrap">
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">타입</th>
              <th class="text-left">티켓명</th>
              <th class="text-left">이용횟수</th>
              <th class="text-left">유효기간</th>
              <th class="text-left">가격</th>
              <th class="text-left">인원</th>
              <th class="text-left">고유번호</th>
              <th class="text-left">생성일</th>
              <th class="text-center">액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in paginatedTickets" :key="ticket.id">
              <td>{{ ticket.id }}</td>
              <td>
                <VChip
                  :color="ticket.type === '횟수제' ? 'primary' : 'success'"
                  size="small"
                >
                  {{ ticket.type }}
                </VChip>
              </td>
              <td class="font-weight-medium">{{ ticket.title }}</td>
              <td>
                <span v-if="ticket.type === '횟수제' && ticket.usageCount">
                  총 {{ ticket.usageCount.total || 0 }}회
                  <span v-if="ticket.usageCount.cancellable">
                    (취소가능 {{ ticket.usageCount.cancellable }}회)
                  </span>
                </span>
                <span v-else class="text-grey">-</span>
              </td>
              <td>
                {{ getValidityPeriodText(ticket.validityPeriod) }}
              </td>
              <td class="font-weight-medium">
                {{ formatPrice(ticket.price) }}원
              </td>
              <td>
                {{ ticket.maxParticipants === 'unlimited' ? '무제한' : `${ticket.maxParticipants}명` }}
              </td>
              <td>
                <VChip size="small" variant="outlined">
                  {{ getUniqueCodeTitle(ticket.uniqueCodeId) }}
                </VChip>
              </td>
              <td>{{ formatDate(ticket.createdAt) }}</td>
              <td class="text-center">
                <div class="d-flex gap-1 justify-center">
                  <VBtn
                    icon
                    size="small"
                    variant="text"
                    @click="openEditModal(ticket)"
                  >
                    <VIcon icon="ri-edit-line" />
                  </VBtn>
                  <VBtn
                    icon
                    size="small"
                    variant="text"
                    color="secondary"
                    @click="confirmDelete(ticket)"
                  >
                    <VIcon icon="ri-delete-bin-line" />
                  </VBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- 빈 상태 -->
        <div v-if="filteredTickets.length === 0" class="text-center py-8">
          <VIcon icon="ri-ticket-line" size="64" class="text-grey mb-4" />
          <h3 class="text-h6 mb-2">티켓이 없습니다</h3>
          <p class="text-body-2 text-grey mb-4">
            새로운 티켓을 추가해보세요.
          </p>
          <VBtn
            v-if="!search"
            color="primary"
            variant="text"
            @click="openCreateModal"
            class="mt-4"
          >
            첫 번째 티켓 추가
          </VBtn>
        </div>
      </VCardText>

      <!-- 페이지네이션 -->
      <VCardActions v-if="totalPages > 1" class="justify-center">
        <VPagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
        />
      </VCardActions>
    </VCard>

    <!-- 삭제 확인 다이얼로그 -->
    <VDialog v-model="deleteDialog.show" max-width="400">
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="ri-alert-line" class="mr-2" color="warning" />
          티켓 삭제 확인
        </VCardTitle>
        <VCardText>
          <p class="mb-2">
            "<strong>{{ deleteDialog.item?.title }}</strong>" 티켓을 삭제하시겠습니까?
          </p>
          <p class="text-caption text-warning">
            이 작업은 되돌릴 수 없습니다.
          </p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="cancelDelete" :disabled="deleteDialog.loading">
            취소
          </VBtn>
          <VBtn
            color="secondary"
            :loading="deleteDialog.loading"
            @click="executeDelete"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- 티켓 모달 -->
    <TicketModal />
  </div>
</template>

<script setup lang="ts">
import type { Ticket } from '~/types/membership'
import TicketModal from './TicketModal.vue'
import dayjs from 'dayjs'

// Composables
const { 
  tickets,
  uniqueCodes,
  deleteTicket,
  getUniqueCodeById,
  openTicketModal,
  ticketModal
} = useMembership()

const { $toast } = useNuxtApp()

// 상태
const searchQuery = ref('')
const selectedType = ref<string>()
const selectedUniqueCode = ref<number>()
const currentPage = ref(1)
const itemsPerPage = 10

const deleteDialog = ref({
  show: false,
  item: null as Ticket | null,
  loading: false
})

// 티켓 타입 옵션
const ticketTypeOptions = [
  { title: '횟수제', value: '횟수제' },
  { title: '기간제', value: '기간제' }
]

// 고유번호 옵션
const uniqueCodeOptions = computed(() => 
  uniqueCodes.value.map(code => ({
    title: code.title,
    value: code.id
  }))
)

// 필터링된 티켓 목록
const filteredTickets = computed(() => {
  let filtered = [...tickets.value]

  // 검색어 필터링
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(ticket => 
      ticket.title.toLowerCase().includes(query) ||
      ticket.type.toLowerCase().includes(query)
    )
  }

  // 타입 필터링
  if (selectedType.value) {
    filtered = filtered.filter(ticket => ticket.type === selectedType.value)
  }

  // 고유번호 필터링
  if (selectedUniqueCode.value) {
    filtered = filtered.filter(ticket => ticket.uniqueCodeId === selectedUniqueCode.value)
  }

  return filtered
})

// 페이지네이션
const totalPages = computed(() => 
  Math.ceil(filteredTickets.value.length / itemsPerPage)
)

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTickets.value.slice(start, end)
})

// 메서드
const handleSearch = () => {
  currentPage.value = 1
}

const openCreateModal = () => {
  openTicketModal('create')
}

const openEditModal = (ticket: Ticket) => {
  openTicketModal('edit', ticket)
}

const confirmDelete = (ticket: Ticket) => {
  deleteDialog.value = {
    show: true,
    item: ticket,
    loading: false
  }
}

const cancelDelete = () => {
  deleteDialog.value = {
    show: false,
    item: null,
    loading: false
  }
}

const executeDelete = async () => {
  if (!deleteDialog.value.item) return

  try {
    deleteDialog.value.loading = true
    await deleteTicket(deleteDialog.value.item.id)
    $toast?.success('티켓이 삭제되었습니다.')
    cancelDelete()
  } catch (error) {
    console.error('삭제 실패:', error)
    if (error instanceof Error) {
      $toast?.error(error.message)
    } else {
      $toast?.error('티켓 삭제에 실패했습니다.')
    }
  } finally {
    deleteDialog.value.loading = false
  }
}

// 유틸리티 함수
const getValidityPeriodText = (period: any) => {
  if (period.type === '기타') {
    return `${period.days}일`
  }
  return period.type
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR').format(price)
}

const getUniqueCodeTitle = (uniqueCodeId: number) => {
  const uniqueCode = getUniqueCodeById(uniqueCodeId)
  return uniqueCode?.title || `ID: ${uniqueCodeId}`
}

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY.MM.DD.')
}

// 검색 필터 변경 시 페이지 리셋
watch([selectedType, selectedUniqueCode], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.ticket-tab {
  width: 100%;
}

.text-no-wrap th,
.text-no-wrap td {
  white-space: nowrap;
}
</style> 