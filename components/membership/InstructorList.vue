<template>
  <VCard flat>
    <!-- 강사 테이블 -->
    <VTable class="instructor-table" density="comfortable">
      <thead>
        <tr>
          <th class="text-left">ID</th>
          <th class="text-left">강사명</th>
          <th class="text-left">전문분야</th>
          <th class="text-left">소속 지점</th>
          <th class="text-left">생성일</th>
          <th class="text-center">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in pagedInstructors" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.specialty }}</td>
          <td>
            <template v-if="item.assignedBranches && item.assignedBranches.length > 0">
              <VChip v-for="branchId in item.assignedBranches" :key="branchId" size="small" class="mr-1 mb-1">
                {{ getBranchNameById(branchId) }}
              </VChip>
            </template>
            <span v-else>없음</span>
          </td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td class="action-buttons">
            <VBtn icon size="small" variant="text" color="primary" @click="openEditModal(item)">
              <VIcon>ri-edit-line</VIcon>
            </VBtn>
          </td>
        </tr>
        <tr v-if="pagedInstructors.length === 0">
          <td colspan="6" class="text-center py-4">등록된 강사 정보가 없습니다.</td>
        </tr>
      </tbody>
    </VTable>

    <!-- 페이지네이션 -->
    <div class="pagination-wrapper mt-4">
      <VPagination v-model="currentPage" :length="pageCount" color="primary" size="small" :total-visible="5" />
    </div>

    <!-- 수정 모달 -->
    <VDialog v-model="showEditDialog" max-width="600">
      <VCard>
        <VCardTitle class="font-weight-bold">강사 정보 수정</VCardTitle>
        <VCardText class="d-flex flex-column">
          <VTextField v-model="editingInstructor.name" label="강사명" class="mb-3" />
          <VTextField v-model="editingInstructor.specialty" label="전문분야" class="mb-3" />
          <VTextarea v-model="editingInstructor.careerInfo" label="주요 경력/소개" rows="3" class="mb-3" />
          <VTextField
            v-model="editingInstructor.assignedBranches_raw"
            label="소속 지점 ID (쉼표로 구분)"
            class="mb-3"
            hint="예: 101,102"
            persistent-hint
          />
          <VSelect v-model="editingInstructor.status" :items="['활동중', '휴직', '퇴사']" label="상태" class="mb-3" />
        </VCardText>

        <VDivider />

        <VCardActions class="justify-space-between">
          <VBtn variant="text" color="error" size="small" class="text-caption" @click="deleteInstructorAndCloseDialog">
            삭제
          </VBtn>
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

interface Instructor {
  id: number;
  name: string;
  specialty?: string;
  profileImageUrl?: string;
  contact?: string;
  status: '활동중' | '휴직' | '퇴사';
  careerInfo?: string;
  assignedBranches: number[];
  createdAt: Date;
  updatedAt: Date;
  assignedBranches_raw?: string;
}

// 지점 정보 (MembershipList.vue에서 가져옴)
interface TempBranch {
  id: number;
  name: string;
}

const tempBranches = ref<TempBranch[]>([
  { id: 101, name: '강남점' },
  { id: 102, name: '판교점' },
  { id: 103, name: '홍대점' },
]);

const getBranchNameById = (branchId: number): string => {
  const branch = tempBranches.value.find((b) => b.id === branchId);
  return branch ? branch.name : `ID:${branchId}`;
};

const instructors = ref<Instructor[]>([
  {
    id: 1,
    name: '김철수',
    specialty: '드라이버 교정',
    status: '활동중',
    assignedBranches: [101, 102],
    createdAt: new Date(2023, 0, 10),
    updatedAt: new Date(2023, 5, 10),
    careerInfo: 'KPGA 정회원, 전국 대회 우승 경력 다수.',
  },
  {
    id: 2,
    name: '이영희',
    specialty: '아이언 정확도 향상',
    status: '활동중',
    assignedBranches: [101],
    createdAt: new Date(2023, 1, 15),
    updatedAt: new Date(2023, 6, 1),
    careerInfo: 'KLPGA 프로, 다년간 레슨 경험 보유.',
  },
  {
    id: 3,
    name: '박민준',
    specialty: '숏게임 마스터',
    status: '휴직',
    assignedBranches: [102],
    createdAt: new Date(2022, 11, 20),
    updatedAt: new Date(2023, 4, 20),
    careerInfo: '유소년 골프 코치 경력.',
  },
  {
    id: 4,
    name: '최유리',
    specialty: '비거리 증가 전문',
    status: '활동중',
    assignedBranches: [], // 지점 없음
    createdAt: new Date(2023, 3, 5),
    updatedAt: new Date(2023, 7, 1),
    careerInfo: '피트니스 연계 골프 트레이닝 전문.',
  },
]);

const currentPage = ref(1);
const itemsPerPage = 5;

const pageCount = computed(() => Math.ceil(instructors.value.length / itemsPerPage));
const pagedInstructors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return instructors.value.slice(start, start + itemsPerPage);
});

const showEditDialog = ref(false);
const editingInstructor = ref<Partial<Instructor>>({});

const openEditModal = (item: Instructor) => {
  const itemWithRaw = {
    ...item,
    assignedBranches_raw: item.assignedBranches.join(','),
  };
  editingInstructor.value = JSON.parse(JSON.stringify(itemWithRaw));
  showEditDialog.value = true;
};

const closeEditModal = () => {
  showEditDialog.value = false;
  editingInstructor.value = {};
};

const saveInstructor = () => {
  if (!editingInstructor.value.id) return;
  const idx = instructors.value.findIndex((i) => i.id === editingInstructor.value.id);
  if (idx !== -1) {
    const updatedData = { ...editingInstructor.value };
    updatedData.assignedBranches = updatedData.assignedBranches_raw
      ? updatedData.assignedBranches_raw
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n))
      : [];
    delete updatedData.assignedBranches_raw;
    updatedData.updatedAt = new Date();
    instructors.value[idx] = updatedData as Instructor;
  }
  closeEditModal();
};

const deleteInstructorAndCloseDialog = () => {
  if (!editingInstructor.value.id) return;
  instructors.value = instructors.value.filter((i) => i.id !== editingInstructor.value.id);
  closeEditModal();
};

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR');
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
.mb-3 {
  margin-bottom: 12px !important;
}
/* VChip 간격 조정을 위한 스타일 추가 */
.mr-1 {
  margin-right: 4px;
}
.mb-1 {
  margin-bottom: 4px;
}
</style>
