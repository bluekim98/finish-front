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
          <th class="text-left">담당강사</th>
          <th class="text-left">소속지점</th>
          <th class="text-left">생성일</th>
          <th class="text-center">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in pagedMemberships" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.durationValue }} {{ item.durationUnit }}</td>
          <td>{{ item.price.toLocaleString() }}원</td>
          <td>{{ item.status }}</td>
          <td>{{ getInstructorName(item.instructorId) }}</td>
          <td>{{ getBranchName(item.branchId) }}</td>
          <td>{{ formatDate(item.createdAt) }}</td>
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
    <VDialog v-model="showEditDialog" max-width="600">
      <VCard>
        <VCardTitle class="font-weight-bold">수강권 수정</VCardTitle>
        <VCardText class="d-flex flex-column">
          <VTextField v-model="editingMembership.name" label="수강권명" class="mb-3" />
          <VSelect v-model="editingMembership.type" :items="['연습', '레슨']" label="타입" class="mb-3" />
          <VRow class="mb-3">
            <VCol cols="8">
              <VTextField v-model.number="editingMembership.durationValue" label="기간 값" type="number" />
            </VCol>
            <VCol cols="4">
              <VSelect v-model="editingMembership.durationUnit" :items="['일', '개월', '회']" label="단위" />
            </VCol>
          </VRow>
          <VTextField v-model.number="editingMembership.price" label="가격" type="number" class="mb-3" />
          <VTextarea v-model="editingMembership.description" label="설명" rows="2" class="mb-3" />

          <VSelect
            v-model="editingMembership.instructorId"
            :items="instructorSelectItems"
            label="담당 강사"
            item-title="name"
            item-value="id"
            clearable
            :disabled="editingMembership.type === '연습'"
            class="mb-3"
          />

          <VSelect
            v-model="editingMembership.branchId"
            :items="branchSelectItems"
            label="소속 지점"
            item-title="name"
            item-value="id"
            class="mb-3"
          />
          <VSelect v-model="editingMembership.status" :items="['활성', '비활성']" label="상태" class="mb-3" />
        </VCardText>

        <VDivider />

        <VCardActions class="justify-space-between">
          <VBtn variant="text" color="error" size="small" class="text-caption" @click="deleteMembershipAndCloseDialog">
            삭제
          </VBtn>
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
import { ref, computed, watch } from 'vue';

interface Membership {
  id: number;
  name: string;
  type: '연습' | '레슨';
  durationValue: number;
  durationUnit: '일' | '개월' | '회';
  price: number;
  status: '활성' | '비활성';
  description: string;
  instructorId: number | null;
  branchId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TempInstructor {
  id: number;
  name: string;
}
interface TempBranch {
  id: number;
  name: string;
}

const tempInstructors = ref<TempInstructor[]>([
  { id: 1, name: '김철수 강사' },
  { id: 2, name: '이영희 강사' },
  { id: 3, name: '박민준 강사' },
]);

const instructorSelectItems = computed(() => tempInstructors.value.map((inst) => ({ id: inst.id, name: inst.name })));

const tempBranches = ref<TempBranch[]>([
  { id: 101, name: '강남점' },
  { id: 102, name: '판교점' },
  { id: 103, name: '홍대점' },
]);

const branchSelectItems = computed(() => tempBranches.value.map((branch) => ({ id: branch.id, name: branch.name })));

const memberships = ref<Membership[]>([
  {
    id: 1,
    name: '프리미엄 연습권',
    type: '연습',
    durationValue: 3,
    durationUnit: '개월',
    price: 300000,
    status: '활성',
    description: '최신 GDR 장비 무제한 이용',
    instructorId: null,
    branchId: 101,
    createdAt: new Date(2023, 0, 15),
    updatedAt: new Date(2023, 0, 15),
  },
  {
    id: 2,
    name: 'VIP 레슨 패키지',
    type: '레슨',
    durationValue: 6,
    durationUnit: '개월',
    price: 1000000,
    status: '활성',
    description: '이영희 강사 1:1 집중 레슨',
    instructorId: 2,
    branchId: 101,
    createdAt: new Date(2023, 1, 10),
    updatedAt: new Date(2023, 1, 12),
  },
  {
    id: 3,
    name: '단기 연습권 (30일)',
    type: '연습',
    durationValue: 30,
    durationUnit: '일',
    price: 100000,
    status: '비활성',
    description: '단기간 이용 고객 특가',
    instructorId: null,
    branchId: 102,
    createdAt: new Date(2023, 2, 5),
    updatedAt: new Date(2023, 2, 5),
  },
  {
    id: 4,
    name: '주말 10회 연습권',
    type: '연습',
    durationValue: 10,
    durationUnit: '회',
    price: 150000,
    status: '활성',
    description: '주말 집중 연습용',
    instructorId: null,
    branchId: 103,
    createdAt: new Date(2023, 3, 1),
    updatedAt: new Date(2023, 3, 1),
  },
]);

const currentPage = ref(1);
const itemsPerPage = 5;

const pageCount = computed(() => Math.ceil(memberships.value.length / itemsPerPage));
const pagedMemberships = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return memberships.value.slice(start, start + itemsPerPage);
});

const showEditDialog = ref(false);
const editingMembership = ref<Partial<Membership>>({});

watch(
  () => editingMembership.value.type,
  (newType) => {
    if (newType === '연습') {
      editingMembership.value.instructorId = null;
    }
  },
);

const getInstructorName = (instructorId: number | null | undefined): string => {
  if (instructorId === null || instructorId === undefined) return '없음';
  return tempInstructors.value.find((inst) => inst.id === instructorId)?.name || `ID:${instructorId}`;
};

const getBranchName = (branchId: number | null | undefined): string => {
  if (branchId === null || branchId === undefined) return '없음';
  return tempBranches.value.find((br) => br.id === branchId)?.name || `ID:${branchId}`;
};

const openEditModal = (item: Membership) => {
  editingMembership.value = JSON.parse(JSON.stringify(item));
  showEditDialog.value = true;
};

const closeEditModal = () => {
  showEditDialog.value = false;
  editingMembership.value = {};
};

const saveMembership = () => {
  if (!editingMembership.value.id) return;

  if (editingMembership.value.type === '레슨' && !editingMembership.value.instructorId) {
    alert('레슨권은 담당 강사를 지정해야 합니다.');
    return;
  }
  if (!editingMembership.value.branchId) {
    alert('소속 지점은 필수입니다.');
    return;
  }

  if (editingMembership.value.type === '연습') {
    editingMembership.value.instructorId = null;
  }

  const idx = memberships.value.findIndex((m) => m.id === editingMembership.value.id);
  if (idx !== -1) {
    const updatedData = { ...editingMembership.value };
    updatedData.updatedAt = new Date();
    memberships.value[idx] = updatedData as Membership;
  }
  closeEditModal();
};

const deleteMembershipAndCloseDialog = () => {
  if (!editingMembership.value.id) return;
  memberships.value = memberships.value.filter((m) => m.id !== editingMembership.value.id);
  closeEditModal();
};

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR');
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
.mb-3 {
  margin-bottom: 12px !important;
}
</style>
