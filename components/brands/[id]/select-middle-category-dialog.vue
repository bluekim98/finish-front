<script setup lang="ts">
import Swal from 'sweetalert2';

const props = defineProps({
  dialog: {
    type: Boolean,
    required: true,
  },
  selectedName: {
    type: String,
    required: true,
  },
  selectedCode: {
    type: String,
    required: true,
  },
  brandId: {
    type: Number,
    required: true,
  },
  brandName: {
    type: String,
  },
  tabCount: {
    type: Number,
  },
});

const emit = defineEmits([
  'update:dialog',
  'update:selectedName',
  'update:selectedCode',
  'complete-button-click',
  'close-dialog',
]);

const localDialog = ref(props.dialog);
const localSelectedName = ref(props.selectedName);
const localSelectedCode = ref(props.selectedCode);

watch(
  () => props.dialog,
  (newDialog) => {
    localDialog.value = newDialog;
  },
);

watch(
  () => props.selectedName,
  (newSelectedName) => {
    localSelectedName.value = newSelectedName;
  },
);

watch(
  () => props.selectedCode,
  (newSelectedCode) => {
    localSelectedCode.value = newSelectedCode;
  },
);

watch(localDialog, (newDialog) => {
  emit('update:dialog', newDialog);
});

watch(localSelectedName, (newSelectedName) => {
  emit('update:selectedName', newSelectedName);
});

watch(localSelectedCode, (newSelectedCode) => {
  emit('update:selectedCode', newSelectedCode);
});

const middleCategoryList = ref<ApiResponseBody['/brand/{brandId}/convertible-middle-category']['get']['items']>([]);
const totalPages = ref(1);
const isLoading = ref(true);

const PAGE_SIZE = 4;

const defaultQuery: ApiQueryParams['/brand/{brandId}/convertible-middle-category']['get'] = {
  page: 1,
  pageSize: PAGE_SIZE,
  keyword: '',
};

const query = reactive({
  ...defaultQuery,
});

const search = () => {
  fetchMiddleCategoryInfo();
};

const reset = () => {
  Object.assign(query, defaultQuery);
  fetchMiddleCategoryInfo();
};

const handleKeywordChange = () => {
  query.page = 1;
};

const handleBrandBISeparationClick = () => {
  localDialog.value = true;

  fetchMiddleCategoryInfo();
};

const handleMiddleCategorySelect = (item: ApiResponseBody['/brand/convertible']['get']['items'][number]) => {
  if (localSelectedCode.value === item.estCd) {
    localSelectedCode.value = '';

    return;
  }

  localSelectedName.value = item.estName ?? '';
  localSelectedCode.value = item.estCd;
};

const fetchMiddleCategoryInfo = async () => {
  try {
    const { data } = await makeApiClient().GET('/brand/{brandId}/convertible-middle-category', {
      params: {
        path: {
          brandId: props.brandId,
        },
        query,
      },
    });

    middleCategoryList.value = data?.items || [];
    totalPages.value = data?.pagination.totalPage || 1;
  } catch (error) {
    Swal.fire({
      icon: 'error',
      html: `<div style="white-space: pre-wrap;">GET('/brand/convertible-middle-category') 실패\n${error}</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => [query.page, query.pageSize],
  () => {
    fetchMiddleCategoryInfo();
  },
);
</script>

<template>
  <VBtn variant="outlined" color="grey-900" @click="handleBrandBISeparationClick">브랜드 BI 분리</VBtn>
  <VDialog
    v-model="localDialog"
    v-if="middleCategoryList"
    content-class="d-flex justify-center align-center"
    width="auto"
    @click:outside="emit('close-dialog')"
  >
    <div v-if="isLoading" />
    <div v-else>
      <!-- 브랜드 BI가 최대(20개)인 경우 -->
      <VCard v-if="tabCount === 20" class="d-flex flex-column align-center pa-12">
        <div class="text-h4 font-weight-bold">최대 20개까지 브랜드BI 분리할 수 있습니다.</div>
        <div class="d-flex flex-column justify-center align-center pt-5">
          <div>사용하지 않는 브랜드BI를 삭제 후 사용하거나,</div>
          <div>20개 이상 브랜드BI 필요 시 프로덕트실에 문의해주세요.</div>
        </div>
        <div class="d-flex align-end pt-11">
          <VBtn @click="localDialog = false">확인</VBtn>
        </div>
      </VCard>

      <!-- 브랜드 BI가 존재하는 경우 -->
      <VCard v-else-if="middleCategoryList.length > 0" class="pa-12" width="850">
        <VForm @submit.prevent="search">
          <div class="text-h4 font-weight-bold">
            <span class="text-primary">{{ props.brandName }}</span>
            브랜드 BI 분리
          </div>
          <div class="text-h5 font-weight-bold pt-10">중분류 선택</div>
          <div class="pt-3">선택한 중분류가 부여된 가맹점 고객에 브랜드 BI가 분리 적용됩니다.</div>
          <VRow class="py-8">
            <VCol>
              <VTextField
                v-model="query.keyword"
                label="중분류코드 / 중분류명"
                placeholder="중분류코드 / 중분류명"
                @change="handleKeywordChange"
              />
            </VCol>
            <VCol cols="auto" class="d-flex flex-wrap gap-4 justify-end align-center">
              <VBtn color="secondary" variant="outlined" type="reset" @click.prevent="reset">초기화</VBtn>
              <VBtn type="submit">검색</VBtn>
            </VCol>
          </VRow>
        </VForm>

        <VTable :height="PAGE_SIZE * 50 + 56">
          <thead>
            <tr>
              <th class="text-center no-wrap font-weight-bold">중분류코드</th>
              <th class="text-center no-wrap font-weight-bold">중분류명</th>
              <th class="text-center no-wrap font-weight-bold">지점 수</th>
            </tr>
          </thead>
          <tbody>
            <tr
              :class="{
                'selected-row': localSelectedCode === item.estCd,
                'hovered-row': localSelectedCode !== item.estCd,
              }"
              v-for="item in middleCategoryList"
              :key="item.estCd"
              @click="handleMiddleCategorySelect(item)"
            >
              <td class="text-center no-wrap">{{ item.estCd }}</td>
              <td class="text-center no-wrap">{{ item.estName }}</td>
              <td class="text-center no-wrap">{{ item.storeCount || 0 }}</td>
            </tr>
          </tbody>
        </VTable>

        <VPagination class="pt-4" v-model="query.page" :length="totalPages" total-visible="8" />

        <VCol cols="auto" class="d-flex flex-wrap gap-4 justify-end align-center pt-6">
          <VBtn color="secondary" variant="outlined" @click.prevent="emit('close-dialog')">닫기</VBtn>
          <VBtn @click="emit('complete-button-click')" :disabled="localSelectedCode === ''">선택완료</VBtn>
        </VCol>
      </VCard>

      <!-- 브랜드 BI가 없는 경우 -->
      <VCard v-else class="d-flex align-center flex-column pa-12">
        <div class="text-h4 font-weight-bold">BI를 분리할 수 있는 중분류가 없습니다.</div>
        <div class="d-flex flex-column justify-center align-center text-subtitle-1 pt-5">
          <div>FreshOn에서 본사코드(본점고객코드)와 다른 중분류코드를</div>
          <div>1개 이상 등록 후 다시 시도해주세요.</div>
        </div>
        <div class="d-flex align-end pt-11">
          <VBtn @click="localDialog = false">확인</VBtn>
        </div>
      </VCard>
    </div>
  </VDialog>
</template>

<style scoped>
.no-wrap {
  white-space: nowrap;
}

.hovered-row:hover {
  cursor: pointer;
  background-color: #f5f5f5;
}

.selected-row {
  cursor: pointer;
  background-color: #e8f5ef;
}
</style>
