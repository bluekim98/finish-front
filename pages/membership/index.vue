<template>
  <VContainer>
    <!-- 상단 타이틀 + 등록 버튼 -->
    <VRow align="center" justify="space-between" class="mb-6">
      <VCol cols="auto" class="text-h5 font-weight-bold">멤버십 관리</VCol>
      <VCol cols="auto">
        <VBtn color="primary" @click="openRegisterModal">{{ modalTitle }} 등록</VBtn>
      </VCol>
    </VRow>

    <!-- 탭바 -->
    <VTabs v-model="currentTab" align-tabs="start" slider-color="primary">
      <VTab value="membership">수강권</VTab>
      <VTab value="instructor">강사</VTab>
      <VTab value="branch">지점</VTab>
    </VTabs>

    <VWindow v-model="currentTab" class="mt-4">
      <!-- 수강권 탭 -->
      <VWindowItem value="membership">
        <MembershipList />
      </VWindowItem>

      <!-- 강사 탭 -->
      <VWindowItem value="instructor">
        <InstructorList />
      </VWindowItem>

      <!-- 지점 탭 -->
      <VWindowItem value="branch">
        <BranchList />
      </VWindowItem>
    </VWindow>

    <!-- 등록 모달 (수강권/강사/지점 공용) -->
    <VDialog v-model="showRegisterModal" width="600">
      <VCard>
        <VCardTitle class="text-h6 font-weight-bold">{{ modalTitle }} 등록</VCardTitle>
        <VCardText>
          <component :is="currentRegisterComponent" @close="closeRegisterModal" v-if="currentRegisterComponent" />
          <div v-else>등록 폼이 준비되지 않았습니다.</div>
        </VCardText>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 임시: 등록 폼 컴포넌트 (추후 실제 컴포넌트로 교체 필요)
const MembershipRegisterForm = null;
const InstructorRegisterForm = null;
const BranchRegisterForm = null;

const currentTab = ref('membership');
const showRegisterModal = ref(false);

const openRegisterModal = () => {
  showRegisterModal.value = true;
};
const closeRegisterModal = () => {
  showRegisterModal.value = false;
};

const modalTitle = computed(() => {
  switch (currentTab.value) {
    case 'membership':
      return '수강권';
    case 'instructor':
      return '강사';
    case 'branch':
      return '지점';
    default:
      return '';
  }
});

const currentRegisterComponent = computed(() => {
  switch (currentTab.value) {
    case 'membership':
      return MembershipRegisterForm;
    case 'instructor':
      return InstructorRegisterForm;
    case 'branch':
      return BranchRegisterForm;
    default:
      return MembershipRegisterForm;
  }
});
</script>

<style scoped></style>
