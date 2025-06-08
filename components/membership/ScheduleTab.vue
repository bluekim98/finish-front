<template>
  <div>
    <!-- 액션 바 -->
    <VRow class="mb-4 mt-1">
      <VCol cols="12" md="9">
        <VRow align="center">
          <VCol cols="12" md="4">
            <VTextField
              v-model="searchQuery"
              label="검색"
              placeholder="일정명, 강사명으로 검색"
              variant="outlined"
              density="compact"
              prepend-inner-icon="ri-search-line"
              clearable
              @keyup.enter="handleSearch"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect
              v-model="selectedInstructor"
              label="담당강사"
              :items="instructorOptions"
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
      <VCol cols="12" md="3" class="d-flex justify-end align-center">
        <VBtn
          color="primary"
          variant="text"
          @click="openCreateModal"
          prepend-icon="ri-add-line"
        >
          일정 추가
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
              <th class="text-left">일정명</th>
              <th class="text-left">담당강사</th>
              <th class="text-left">기간</th>
              <th class="text-left">시간</th>
              <th class="text-left">최대인원</th>
              <th class="text-left">장소</th>
              <th class="text-left">고유번호</th>
              <th class="text-center">액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="schedule in paginatedSchedules" :key="schedule.id">
              <td>{{ schedule.id }}</td>
              <td class="font-weight-medium">{{ schedule.title }}</td>
              <td>
                <span v-if="schedule.instructor">{{ schedule.instructor }}</span>
                <span v-else class="text-grey">-</span>
              </td>
              <td>{{ formatDateRange(schedule.startDate, schedule.endDate) }}</td>
              <td>
                <span v-if="schedule.startTime && schedule.endTime">
                  {{ formatTimeRange(schedule.startTime, schedule.endTime) }}
                </span>
                <span v-else class="text-grey">하루종일</span>
              </td>
              <td>
                {{ schedule.maxParticipants === 'unlimited' ? '무제한' : `${schedule.maxParticipants}명` }}
              </td>
              <td>
                <span v-if="schedule.location">{{ schedule.location }}</span>
                <span v-else class="text-grey">-</span>
              </td>
              <td>
                <VChip size="small" variant="tonal" color="secondary">
                  {{ schedule.uniqueCodeIds.length }}개
                </VChip>
              </td>
              <td class="text-center">
                <div class="d-flex gap-1 justify-center">
                  <VBtn
                    icon
                    size="small"
                    variant="text"
                    @click="openEditModal(schedule)"
                  >
                    <VIcon icon="ri-edit-line" />
                  </VBtn>
                  <VBtn
                    icon
                    size="small"
                    variant="text"
                    color="secondary"
                    @click="confirmDelete(schedule)"
                  >
                    <VIcon icon="ri-delete-bin-line" />
                  </VBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- 빈 상태 -->
        <div v-if="filteredSchedules.length === 0" class="text-center py-8">
          <VIcon icon="ri-calendar-event-line" size="64" class="text-grey mb-4" />
          <h3 class="text-h6 mb-2">일정이 없습니다</h3>
          <p class="text-body-2 text-grey mb-4">
            새로운 일정을 추가해보세요.
          </p>
          <VBtn
            v-if="!searchQuery"
            color="primary"
            variant="text"
            @click="openCreateModal"
            class="mt-4"
          >
            첫 번째 일정 추가
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

    <!-- 스케줄 모달 -->
    <ScheduleModal
      v-model:show="showModal"
      :edit-data="editSchedule"
      @submit="handleSubmit"
    />

    <!-- 삭제 확인 다이얼로그 -->
    <VDialog v-model="deleteDialog.show" max-width="500">
      <VCard>
        <VCardTitle class="pa-6 pb-4">
          일정 삭제
        </VCardTitle>
        <VCardText class="pa-6 pt-0">
          <p>정말로 이 일정을 삭제하시겠습니까?</p>
          <p class="text-caption mt-2">
            일정명: {{ deleteDialog.schedule?.title }}
          </p>
        </VCardText>
        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="text"
            color="secondary"
            @click="deleteDialog.show = false"
          >
            취소
          </VBtn>
          <VBtn
            color="error"
            @click="handleDelete"
            :loading="deleteDialog.loading"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import type { Schedule } from '~/types/membership'
import dayjs from 'dayjs'
import ScheduleModal from './ScheduleModal.vue'

// Composables
const { 
  schedules,
  uniqueCodes,
  getUniqueCodeById,
  getSchedulesByUniqueCodeId,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = useMembership()

// 상태
const searchQuery = ref('')
const selectedInstructor = ref<string | null>(null)
const selectedUniqueCode = ref<number | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10

// 모달 상태
const showModal = ref(false)
const editSchedule = ref<Schedule | undefined>()

// 삭제 다이얼로그 상태
const deleteDialog = ref({
  show: false,
  schedule: null as Schedule | null,
  loading: false
})

// 계산된 속성
const instructorOptions = computed(() => {
  const instructors = new Set<string>()
  schedules.value.forEach(schedule => {
    if (schedule.instructor) {
      instructors.add(schedule.instructor)
    }
  })
  return Array.from(instructors)
})

const uniqueCodeOptions = computed(() => {
  return uniqueCodes.value.map(code => ({
    title: code.title,
    value: code.id
  }))
})

const filteredSchedules = computed(() => {
  let result = [...schedules.value]

  // 검색어 필터링
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(schedule => 
      schedule.title.toLowerCase().includes(query) ||
      (schedule.instructor && schedule.instructor.toLowerCase().includes(query))
    )
  }

  // 강사 필터링
  if (selectedInstructor.value) {
    result = result.filter(schedule => 
      schedule.instructor === selectedInstructor.value
    )
  }

  // 고유번호 필터링
  if (selectedUniqueCode.value) {
    result = result.filter(schedule => 
      schedule.uniqueCodeIds.includes(selectedUniqueCode.value)
    )
  }

  return result
})

const paginatedSchedules = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredSchedules.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredSchedules.value.length / itemsPerPage)
)

// 메서드
const formatDateRange = (startDate: string, endDate: string) => {
  return `${dayjs(startDate).format('YYYY.MM.DD')} ~ ${dayjs(endDate).format('YYYY.MM.DD')}`
}

const formatTimeRange = (startTime: string, endTime: string) => {
  return `${startTime} ~ ${endTime}`
}

const getUniqueCodeTitle = (uniqueCodeId: number) => {
  const uniqueCode = getUniqueCodeById(uniqueCodeId)
  return uniqueCode?.title || `ID: ${uniqueCodeId}`
}

const handleSearch = () => {
  currentPage.value = 1
}

const openCreateModal = () => {
  editSchedule.value = undefined
  showModal.value = true
}

const openEditModal = (schedule: Schedule) => {
  editSchedule.value = schedule
  showModal.value = true
}

const confirmDelete = (schedule: Schedule) => {
  deleteDialog.value = {
    show: true,
    schedule,
    loading: false
  }
}

const handleSubmit = async (data: Partial<Schedule>) => {
  try {
    if (editSchedule.value) {
      await updateSchedule(editSchedule.value.id, data)
      $toast.success('일정이 수정되었습니다.')
    } else {
      await createSchedule(data)
      $toast.success('일정이 생성되었습니다.')
    }
  } catch (error) {
    console.error('Failed to save schedule:', error)
    $toast.error('일정 저장에 실패했습니다.')
  }
}

const handleDelete = async () => {
  if (!deleteDialog.value.schedule) return

  deleteDialog.value.loading = true
  try {
    await deleteSchedule(deleteDialog.value.schedule.id)
    deleteDialog.value.show = false
    $toast.success('일정이 삭제되었습니다.')
  } catch (error) {
    console.error('Failed to delete schedule:', error)
    $toast.error('일정 삭제에 실패했습니다.')
  } finally {
    deleteDialog.value.loading = false
  }
}

// 필터 변경 시 페이지 리셋
watch([selectedInstructor, selectedUniqueCode], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.text-no-wrap th,
.text-no-wrap td {
  white-space: nowrap;
}
</style> 