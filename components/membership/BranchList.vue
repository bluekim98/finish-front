<template>
  <VCard flat>
    <!-- 지점 테이블 -->
    <VTable class="branch-table" density="comfortable">
      <thead>
        <tr>
          <th class="text-left">지점명</th>
          <th class="text-left">주소</th>
          <th class="text-center">상태</th>
          <th class="text-center">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in pagedBranches" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.address }}</td>
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
        <VCardTitle class="font-weight-bold">지점 수정</VCardTitle>
        <VCardText class="d-flex flex-column">
          <VTextField v-model="editingBranch.name" label="지점명" class="mb-4" />
          <VTextField v-model="editingBranch.address" label="주소" class="mb-4" />
          <VSelect v-model="editingBranch.status" :items="['운영중', '폐점']" label="상태" class="mb-4" />
        </VCardText>

        <VDivider />

        <VCardActions class="justify-space-between">
          <VBtn variant="text" color="error" size="small" class="text-caption" @click="deleteBranch">삭제</VBtn>
          <div class="d-flex gap-2">
            <VBtn color="secondary" size="small" @click="closeEditModal">취소</VBtn>
            <VBtn variant="flat" color="primary" size="small" @click="saveBranch">저장</VBtn>
          </div>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 더미 데이터
const branches = ref([
  { id: 1, name: '강남점', address: '서울특별시 강남구 테헤란로 123', status: '운영중' },
  { id: 2, name: '홍대점', address: '서울특별시 마포구 양화로 45', status: '운영중' },
  { id: 3, name: '부산점', address: '부산광역시 해운대구 APEC로 55', status: '폐점' },
  { id: 4, name: '인천점', address: '인천광역시 연수구 송도과학로 32', status: '운영중' },
  { id: 5, name: '대구점', address: '대구광역시 중구 동성로 77', status: '운영중' },
  { id: 6, name: '광주점', address: '광주광역시 동구 금남로 10', status: '운영중' },
  { id: 7, name: '제주점', address: '제주특별자치도 제주시 도령로 8', status: '운영중' },
]);

// 페이지네이션
const currentPage = ref(1);
const itemsPerPage = 5;

const pageCount = computed(() => Math.ceil(branches.value.length / itemsPerPage));
const pagedBranches = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return branches.value.slice(start, start + itemsPerPage);
});

// 수정 모달 제어
const showEditDialog = ref(false);
const editingBranch = ref<any>({});

const openEditModal = (item: any) => {
  editingBranch.value = { ...item };
  showEditDialog.value = true;
};
const closeEditModal = () => {
  showEditDialog.value = false;
};

// 저장
const saveBranch = () => {
  const idx = branches.value.findIndex((b) => b.id === editingBranch.value.id);
  if (idx !== -1) branches.value[idx] = { ...editingBranch.value };
  closeEditModal();
};

// 삭제
const deleteBranch = () => {
  branches.value = branches.value.filter((b) => b.id !== editingBranch.value.id);
  closeEditModal();
};
</script>

<style scoped>
.branch-table th,
.branch-table td {
  padding: 12px;
  font-size: 14px;
  color: #333;
}
.branch-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}
.branch-table tr:hover {
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
