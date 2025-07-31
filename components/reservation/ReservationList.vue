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
              placeholder="회원명, 일정명으로 검색"
              variant="outlined"
              density="compact"
              prepend-inner-icon="ri-search-line"
              clearable
              @keyup.enter="handleSearch"
            />
          </VCol>

          <VCol cols="12" md="4">
            <VSelect
              v-model="selectedStatus"
              label="상태"
              :items="statusOptions"
              variant="outlined"
              density="compact"
              clearable
            />
          </VCol>

          <VCol cols="12" md="4">
            <VueDatePicker
              v-model="dateRange"
              range
              locale="ko"
              placeholder="날짜 범위"
              :preview-format="formatRangeLabel"
              density="compact"
            />
          </VCol>
        </VRow>
      </VCol>
      <VCol cols="12" md="3" class="d-flex align-center justify-end gap-2">
        <VSelect
          v-model="sortBy"
          :items="sortOptions"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 140px"
        />
        <VBtn color="primary" variant="text" @click="openViewModal" prepend-icon="ri-eye-line" :disabled="true">
          상세 보기
        </VBtn>
      </VCol>
    </VRow>

    <!-- 테이블 -->
    <VCard>
      <VCardText class="pa-0">
        <VTable class="text-no-wrap">
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">회원명</th>
              <th class="text-left">일정명</th>
              <th class="text-left">날짜</th>
              <th class="text-left">시간</th>
              <th class="text-left">상태</th>
              <th class="text-center">액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reservation in paginatedReservations" :key="reservation.id">
              <td>{{ reservation.id }}</td>
              <td class="font-weight-medium">{{ reservation.memberName }}</td>
              <td>{{ reservation.scheduleTitle }}</td>
              <td>{{ reservation.date }}</td>
              <td>
                <span v-if="reservation.startTime && reservation.endTime">
                  {{ reservation.startTime }} ~ {{ reservation.endTime }}
                </span>
                <span v-else>-</span>
              </td>
              <td>
                <VChip size="small" :color="statusColor(reservation.status)" variant="tonal">
                  {{ reservation.status }}
                </VChip>
              </td>
              <td class="text-center">
                <div class="d-flex gap-1 justify-center">
                  <VBtn
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    :disabled="reservation.status === '취소됨'"
                    @click="confirmCancel(reservation)"
                  >
                    <VIcon icon="ri-close-circle-line" />
                  </VBtn>
                  <VBtn icon size="small" variant="text" color="secondary" @click="confirmDelete(reservation)">
                    <VIcon icon="ri-delete-bin-line" />
                  </VBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- 빈 상태 -->
        <div v-if="sortedFilteredReservations.length === 0" class="text-center py-8">
          <VIcon icon="ri-file-list-2-line" size="64" class="text-grey mb-4" />
          <h3 class="text-h6 mb-2">예약 내역이 없습니다</h3>
          <p class="text-body-2 text-grey mb-4">예약 데이터를 추가해보세요.</p>
        </div>
      </VCardText>

      <!-- 페이지네이션 -->
      <VCardActions v-if="totalPages > 1" class="justify-center">
        <VPagination v-model="currentPage" :length="totalPages" :total-visible="7" />
      </VCardActions>
    </VCard>

    <!-- 취소 확인 다이얼로그 -->
    <VDialog v-model="cancelDialog.show" max-width="500">
      <VCard>
        <VCardTitle class="pa-6 pb-4">예약 취소</VCardTitle>
        <VCardText class="pa-6 pt-0">
          <p>정말로 이 예약을 취소하시겠습니까?</p>
          <p class="text-caption mt-2">회원명: {{ cancelDialog.reservation?.memberName }}</p>
          <p class="text-caption">일정명: {{ cancelDialog.reservation?.scheduleTitle }}</p>
        </VCardText>
        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn variant="text" color="secondary" @click="cancelDialog.show = false">취소</VBtn>
          <VBtn color="error" :loading="cancelDialog.loading" @click="handleCancel">확인</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- 삭제 확인 다이얼로그 -->
    <VDialog v-model="deleteDialog.show" max-width="500">
      <VCard>
        <VCardTitle class="pa-6 pb-4">예약 삭제</VCardTitle>
        <VCardText class="pa-6 pt-0">
          <p>정말로 이 예약을 삭제하시겠습니까?</p>
          <p class="text-caption mt-2">회원명: {{ deleteDialog.reservation?.memberName }}</p>
          <p class="text-caption">일정명: {{ deleteDialog.reservation?.scheduleTitle }}</p>
        </VCardText>
        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn variant="text" color="secondary" @click="deleteDialog.show = false">취소</VBtn>
          <VBtn color="error" :loading="deleteDialog.loading" @click="handleDelete">삭제</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import type { Reservation, ReservationStatus } from '~/types/membership';
import { useReservations } from '~/composables/membership/useReservations';
import dayjs from 'dayjs';

// Composable
const { reservations, updateReservationStatus, deleteReservation } = useReservations();

// dummy view modal (to be implemented)
const openViewModal = () => {
  // TODO: implement reservation detail view
};

// 상태
const searchQuery = ref('');
const selectedStatus = ref<ReservationStatus | null>(null);
const currentPage = ref(1);
const itemsPerPage = 10;

// 날짜 범위 (start, end)
const dateRange = ref<[Date | null, Date | null]>([null, null]);

// 정렬 옵션
const sortBy = ref<'recent' | 'oldest'>('recent');
const sortOptions = [
  { title: '최신순', value: 'recent' },
  { title: '오래된순', value: 'oldest' },
];

const formatRangeLabel = (range: [Date | null, Date | null]) => {
  const [start, end] = range;
  if (!start && !end) return '';
  const fmt = (d: Date | null) => (d ? dayjs(d).format('YYYY-MM-DD') : '');
  return `${fmt(start)} ~ ${fmt(end)}`;
};

// 다이얼로그 상태
const cancelDialog = ref({
  show: false,
  reservation: null as Reservation | null,
  loading: false,
});
const deleteDialog = ref({
  show: false,
  reservation: null as Reservation | null,
  loading: false,
});

// 옵션
const statusOptions: ReservationStatus[] = ['예약완료', '취소됨', '대기'];

// 계산된 속성
const sortedFilteredReservations = computed(() => {
  let result = [...reservations.value];

  // 검색
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((r) => r.memberName.toLowerCase().includes(q) || r.scheduleTitle.toLowerCase().includes(q));
  }

  // 상태 필터
  if (selectedStatus.value) {
    result = result.filter((r) => r.status === selectedStatus.value);
  }

  // 날짜 범위 필터
  const [start, end] = dateRange.value;
  if (start || end) {
    result = result.filter((r) => {
      const d = dayjs(r.date, 'YYYY-MM-DD');
      const afterStart = start ? !d.isBefore(dayjs(start), 'day') : true;
      const beforeEnd = end ? !d.isAfter(dayjs(end), 'day') : true;
      return afterStart && beforeEnd;
    });
  }

  // 정렬
  if (sortBy.value === 'recent') {
    result.sort((a, b) => b.date.localeCompare(a.date));
  } else {
    result.sort((a, b) => a.date.localeCompare(b.date));
  }

  return result;
});
const filteredReservations = computed(() => {
  let result = [...reservations.value];

  // 검색
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((r) => r.memberName.toLowerCase().includes(q) || r.scheduleTitle.toLowerCase().includes(q));
  }

  // 상태 필터
  if (selectedStatus.value) {
    result = result.filter((r) => r.status === selectedStatus.value);
  }

  return result;
});

const paginatedReservations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedFilteredReservations.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(sortedFilteredReservations.value.length / itemsPerPage));

// 메서드
const handleSearch = () => {
  currentPage.value = 1;
};

const statusColor = (status: ReservationStatus) => {
  switch (status) {
    case '예약완료':
      return 'primary';
    case '취소됨':
      return 'secondary';
    case '대기':
      return 'secondary';
    default:
      return 'secondary';
  }
};

const confirmCancel = (reservation: Reservation) => {
  cancelDialog.value = { show: true, reservation, loading: false };
};

const handleCancel = async () => {
  if (!cancelDialog.value.reservation) return;
  cancelDialog.value.loading = true;
  try {
    await updateReservationStatus(cancelDialog.value.reservation.id, '취소됨');
    cancelDialog.value.show = false;
  } catch (e) {
    console.error(e);
  } finally {
    cancelDialog.value.loading = false;
  }
};

const confirmDelete = (reservation: Reservation) => {
  deleteDialog.value = { show: true, reservation, loading: false };
};

const handleDelete = async () => {
  if (!deleteDialog.value.reservation) return;
  deleteDialog.value.loading = true;
  try {
    await deleteReservation(deleteDialog.value.reservation.id);
    deleteDialog.value.show = false;
  } catch (e) {
    console.error(e);
  } finally {
    deleteDialog.value.loading = false;
  }
};

// 필터 변경 시 페이지 리셋
watch([selectedStatus], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.text-no-wrap th,
.text-no-wrap td {
  white-space: nowrap;
}
/* 줄무늬 테이블 (두 톤 가독성) */
.text-no-wrap tbody tr:nth-child(even) {
  background-color: rgba(var(--v-theme-on-surface), 0.02);
}
</style>
