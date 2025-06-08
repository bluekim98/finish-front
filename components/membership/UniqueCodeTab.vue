<template>
  <div>
    <!-- 액션 바 -->
    <VRow class="mb-4 mt-1">
      <VCol cols="12" md="6">
        <VTextField
          v-model="search"
          label="고유번호 검색"
          prepend-inner-icon="ri-search-line"
          variant="outlined"
          density="compact"
          clearable
        />
      </VCol>
      <VCol cols="12" md="6" class="d-flex justify-end align-center">
        <VBtn
          color="primary"
          variant="text"
          @click="handleCreate"
          prepend-icon="ri-add-line"
        >
          고유번호 추가
        </VBtn>
      </VCol>
    </VRow>

    <!-- 데이터 테이블 -->
    <VCard>
      <VCardText class="pa-0">
        <VTable class="text-no-wrap">
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">타이틀</th>
              <th class="text-left">비고</th>
              <th class="text-left">연결된 티켓</th>
              <th class="text-left">연결된 일정</th>
              <th class="text-left">생성일</th>
              <th class="text-center">액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id">
              <td>{{ item.id }}</td>
              <td class="font-weight-medium">{{ item.title }}</td>
              <td>
                <span v-if="item.description" class="text-body-2">
                  {{ item.description }}
                </span>
                <span v-else class="text-grey">-</span>
              </td>
              <td>
                <VChip
                  size="small"
                  variant="tonal"
                  color="secondary"
                >
                  {{ getTicketCount(item.id) }}개
                </VChip>
              </td>
              <td>
                <VChip
                  size="small"
                  variant="tonal"
                  color="secondary"
                >
                  {{ getScheduleCount(item.id) }}개
                </VChip>
              </td>
              <td class="text-body-2">
                {{ formatDate(item.createdAt) }}
              </td>
              <td class="text-center">
                <div class="d-flex justify-center gap-2">
                  <VBtn
                    icon="ri-edit-line"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="handleEdit(item)"
                  />
                  <VBtn
                    icon="ri-delete-bin-line"
                    size="small"
                    variant="text"
                    color="secondary"
                    @click="handleDelete(item)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- 데이터 없음 상태 -->
        <div v-if="filteredItems.length === 0" class="text-center py-8">
          <VIcon icon="ri-database-line" size="64" class="text-grey mb-4" />
          <p class="text-h6 mb-2">고유번호가 없습니다</p>
          <p class="text-body-2 text-grey mb-4">
            새로운 고유번호를 추가해보세요.
          </p>
          <VBtn
            v-if="!search"
            color="primary"
            variant="text"
            @click="handleCreate"
            class="mt-4"
          >
            첫 번째 고유번호 추가
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

    <!-- CRUD 모달 -->
    <UniqueCodeModal />

    <!-- 삭제 확인 다이얼로그 -->
    <VDialog v-model="deleteDialog.show" max-width="400">
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="ri-alert-line" class="mr-2" color="warning" />
          고유번호 삭제 확인
        </VCardTitle>
        <VCardText>
          <p class="mb-2">
            "<strong>{{ deleteDialog.item?.title }}</strong>" 고유번호를 삭제하시겠습니까?
          </p>
          <VAlert
            v-if="deleteDialog.hasConnections"
            type="warning"
            class="mt-3"
          >
            연결된 티켓 또는 일정이 있어 삭제할 수 없습니다.
          </VAlert>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="closeDeleteDialog" :disabled="deleteDialog.loading">
            취소
          </VBtn>
          <VBtn
            color="secondary"
            :disabled="deleteDialog.hasConnections"
            :loading="deleteDialog.loading"
            @click="confirmDelete"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import type { UniqueCode } from '~/types/membership'
import dayjs from 'dayjs'

// Composables
const { 
  uniqueCodes, 
  deleteUniqueCode, 
  openUniqueCodeModal,
  getTicketsByUniqueCodeId,
  getSchedulesByUniqueCodeId
} = useMembership()

const { $toast } = useNuxtApp()

// 상태
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// 삭제 다이얼로그 상태
const deleteDialog = ref({
  show: false,
  item: null as UniqueCode | null,
  hasConnections: false,
  loading: false
})

// 계산된 속성
const filteredItems = computed(() => {
  let items = [...uniqueCodes.value]
  
  // 검색 필터링
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    items = items.filter(item => 
      item.title.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    )
  }
  
  // 페이지네이션
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return items.slice(start, end)
})

const totalPages = computed(() => {
  const totalItems = search.value 
    ? uniqueCodes.value.filter(item => 
        item.title.toLowerCase().includes(search.value.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.value.toLowerCase()))
      ).length
    : uniqueCodes.value.length
  return Math.ceil(totalItems / itemsPerPage)
})

// 메서드
const getTicketCount = (uniqueCodeId: number): number => {
  return getTicketsByUniqueCodeId(uniqueCodeId).length
}

const getScheduleCount = (uniqueCodeId: number): number => {
  return getSchedulesByUniqueCodeId(uniqueCodeId).length
}

const formatDate = (dateString: string): string => {
  return dayjs(dateString).format('YYYY.MM.DD.')
}

const handleCreate = () => {
  openUniqueCodeModal('create')
}

const handleEdit = (item: UniqueCode) => {
  openUniqueCodeModal('edit', item)
}

const handleDelete = (item: UniqueCode) => {
  const ticketCount = getTicketCount(item.id)
  const scheduleCount = getScheduleCount(item.id)
  
  deleteDialog.value = {
    show: true,
    item,
    hasConnections: ticketCount > 0 || scheduleCount > 0,
    loading: false
  }
}

const closeDeleteDialog = () => {
  deleteDialog.value = {
    show: false,
    item: null,
    hasConnections: false,
    loading: false
  }
}

const confirmDelete = async () => {
  if (!deleteDialog.value.item) return

  try {
    deleteDialog.value.loading = true
    await deleteUniqueCode(deleteDialog.value.item.id)
    
    $toast?.success('고유번호가 삭제되었습니다.')
    closeDeleteDialog()
  } catch (error) {
    console.error('삭제 실패:', error)
    $toast?.error(error instanceof Error ? error.message : '삭제에 실패했습니다.')
  } finally {
    deleteDialog.value.loading = false
  }
}

// 검색어 변경 시 첫 페이지로 이동
watch(search, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.text-no-wrap th,
.text-no-wrap td {
  white-space: nowrap;
}

.v-table th {
  font-weight: 600 !important;
  color: rgb(var(--v-theme-on-surface)) !important;
}

.v-chip {
  font-weight: 500;
}
</style> 