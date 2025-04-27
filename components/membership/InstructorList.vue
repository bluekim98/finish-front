<template>
  <VCard flat>
    <!-- 강사 테이블 -->
    <VTable class="instructor-table" density="comfortable">
      <thead>
        <tr>
          <th class="text-left">강사명</th>
          <th class="text-left">휴대전화번호</th>
          <th class="text-left">이메일</th>
          <th class="text-center">상태</th>
          <th class="text-center">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in pagedInstructors" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.phone }}</td>
          <td>{{ item.email }}</td>
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
        <VCardTitle class="font-weight-bold">강사 수정</VCardTitle>
        <VCardText class="d-flex flex-column">
          <VTextField v-model="editingInstructor.name" label="강사명" class="mb-4" />
          <VTextField v-model="editingInstructor.phone" label="휴대전화번호" class="mb-4" />
          <VTextField v-model="editingInstructor.email" label="이메일" class="mb-4" />
          <VSelect v-model="editingInstructor.status" :items="['활성', '비활성']" label="상태" class="mb-4" />
        </VCardText>

        <VDivider />

        <VCardActions class="justify-space-between">
          <VBtn variant="text" color="error" size="small" class="text-caption" @click="deleteInstructor">삭제</VBtn>
          <div class="d-flex gap-2">
            <VBtn color="secondary" size="small" @click="closeEditModal">취소</VBtn>
            <VBtn variant="flat" color="primary" size="small" @click="saveInstructor">저장</VBtn>
          </div>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 더미 데이터
const instructors = ref([
  { id: 1, name: '김프로', phone: '010-1111-2222', email: 'kimpro@example.com', status: '활성' },
  { id: 2, name: '이선생', phone: '010-3333-4444', email: 'leesun@example.com', status: '활성' },
  { id: 3, name: '박강사', phone: '010-5555-6666', email: 'park@example.com', status: '비활성' },
  { id: 4, name: '최코치', phone: '010-7777-8888', email: 'choi@example.com', status: '활성' },
  { id: 5, name: '정튜터', phone: '010-9999-0000', email: 'jung@example.com', status: '비활성' },
  { id: 6, name: '장멘토', phone: '010-1212-3434', email: 'jang@example.com', status: '활성' },
]);

// 페이지네이션
const currentPage = ref(1);
const itemsPerPage = 5;

const pageCount = computed(() => Math.ceil(instructors.value.length / itemsPerPage));
const pagedInstructors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return instructors.value.slice(start, start + itemsPerPage);
});

// 수정 모달 제어
const showEditDialog = ref(false);
const editingInstructor = ref<any>({});

const openEditModal = (item: any) => {
  editingInstructor.value = { ...item };
  showEditDialog.value = true;
};
const closeEditModal = () => {
  showEditDialog.value = false;
};

// 저장
const saveInstructor = () => {
  const idx = instructors.value.findIndex((i) => i.id === editingInstructor.value.id);
  if (idx !== -1) instructors.value[idx] = { ...editingInstructor.value };
  closeEditModal();
};

// 삭제
const deleteInstructor = () => {
  instructors.value = instructors.value.filter((i) => i.id !== editingInstructor.value.id);
  closeEditModal();
};
</script>

<style scoped>
.instructor-table th,
.instructor-table td {
  padding: 12px;
  font-size: 14px;
  color: #333;
}
.instructor-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}
.instructor-table tr:hover {
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
