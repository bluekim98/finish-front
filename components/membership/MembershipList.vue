<template>
  <VCard flat>
    <!-- 수강권 테이블 -->
    <VTable class="membership-table" density="comfortable">
      <thead>
        <tr>
          <th class="text-left">수강권명</th>
          <th class="text-left">타입</th>
          <th class="text-left">기간</th>
          <th class="text-left">가격</th>
          <th class="text-left">상태</th>
          <th class="text-center">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in pagedMemberships" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.period }}</td>
          <td>{{ item.price.toLocaleString() }}원</td>
          <td>{{ item.status }}</td>
          <td class="action-buttons">
            <VBtn icon size="small" variant="text" color="primary" @click="openEditModal(item)">
              <VIcon>ri-edit-line</VIcon>
            </VBtn>
          </td>
        </tr>
      </tbody>
    </VTable>

    <!-- 페이지네이션 -->
    <div class="pagination-wrapper">
      <VPagination v-model="currentPage" :length="pageCount" color="primary" size="small" :total-visible="5" />
    </div>

    <!-- 수정 모달 -->
    <VDialog v-model="showEditDialog" max-width="500">
      <VCard>
        <VCardTitle class="font-weight-bold">수강권 수정</VCardTitle>
        <VCardText class="d-flex flex-column">
          <VTextField v-model="editingMembership.name" label="수강권명" class="mb-4" />
          <VSelect v-model="editingMembership.type" :items="['연습', '레슨']" label="타입" class="mb-4" />
          <VTextField v-model="editingMembership.period" label="기간" class="mb-4" />
          <VTextField v-model.number="editingMembership.price" label="가격" type="number" class="mb-4" />
          <VSelect v-model="editingMembership.status" :items="['사용중', '만료']" label="상태" class="mb-4" />
        </VCardText>

        <VDivider />

        <!-- 버튼 배치: 삭제는 왼쪽, 취소/저장은 오른쪽 -->
        <VCardActions class="justify-space-between">
          <VBtn variant="text" color="error" size="small" class="text-caption" @click="deleteMembership">삭제</VBtn>
          <div class="d-flex gap-2">
            <VBtn color="secondary" size="small" @click="closeEditModal">취소</VBtn>
            <VBtn variant="flat" color="primary" size="small" @click="saveMembership">저장</VBtn>
          </div>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 더미 데이터 (price: number)
const memberships = ref([
  { id: 1, name: '프리미엄 연습권', type: '연습', period: '3개월', price: 300000, status: '사용중' },
  { id: 2, name: 'VIP 레슨 패키지', type: '레슨', period: '6개월', price: 1000000, status: '사용중' },
  { id: 3, name: '단기 연습권', type: '연습', period: '1개월', price: 100000, status: '만료' },
  { id: 4, name: '주말 전용 연습권', type: '연습', period: '2개월', price: 200000, status: '사용중' },
  { id: 5, name: '특별 레슨 패키지', type: '레슨', period: '3개월', price: 900000, status: '만료' },
  { id: 6, name: '주중 연습권', type: '연습', period: '1개월', price: 120000, status: '사용중' },
  { id: 7, name: '골드 레슨 패키지', type: '레슨', period: '5개월', price: 950000, status: '사용중' },
]);

// 페이지네이션
const currentPage = ref(1);
const itemsPerPage = 5;

const pageCount = computed(() => Math.ceil(memberships.value.length / itemsPerPage));
const pagedMemberships = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return memberships.value.slice(start, start + itemsPerPage);
});

// 수정 모달 제어
const showEditDialog = ref(false);
const editingMembership = ref<any>({});

const openEditModal = (item: any) => {
  editingMembership.value = { ...item };
  showEditDialog.value = true;
};
const closeEditModal = () => {
  showEditDialog.value = false;
};

// 저장
const saveMembership = () => {
  const idx = memberships.value.findIndex((m) => m.id === editingMembership.value.id);
  if (idx !== -1) memberships.value[idx] = { ...editingMembership.value };
  closeEditModal();
};

// 삭제
const deleteMembership = () => {
  memberships.value = memberships.value.filter((m) => m.id !== editingMembership.value.id);
  closeEditModal();
};
</script>

<style scoped>
.membership-table th,
.membership-table td {
  padding: 12px;
  font-size: 14px;
  color: #333;
}
.membership-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}
.membership-table tr:hover {
  background-color: #fafafa;
}
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
.d-flex.gap-2 {
  display: flex;
  gap: 8px;
}
</style>
