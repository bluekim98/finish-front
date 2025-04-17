<script setup lang="ts">
import dayjs from 'dayjs';
import { VBtn } from 'vuetify/components';
import type { paths } from '~/types/api';
import type { CaribbeanApiQueryParams, CaribbeanApiResponseBody } from '~/utils/api-types';

const route = useRoute();
const brandId = route.params.brand_id as string;

type MyType = CaribbeanApiQueryParams['/brand/convertible']['get'];

const defaultConvertibleSearchQuery: paths['/brand/convertible']['get']['parameters']['query'] = {
  largeGbn: undefined,
  keyword: '',
  page: 1,
  pageSize: 10,
};

const convertibleSearchQuery = reactive({
  ...defaultConvertibleSearchQuery,
});

const fetchConvertibleBrands = async () => {
  const { data } = await makeCaribbeanClient().GET('/brand/convertible', {
    params: {
      query: convertibleSearchQuery,
    },
  });
  console.log(data);
};

const onClick = () => {
  fetchConvertibleBrands();
};

const uiState = reactive({
  dialog: false,
  total_issue_unlimit: true,
  user_issue_unlimit: false,
  selected: undefined as CaribbeanApiResponseBody['/brand/convertible']['get']['items'][number] | undefined,
  searchDialog: false,
  openDate: dayjs().date,
  collectionDateStart: dayjs().date,
  collectionDateEnd: dayjs().date,
});

const meta_coupon_number = brandId;

// 브랜드 선택 처리
const handleBrandSelect = (brand: CaribbeanApiResponseBody['/brand/convertible']['get']['items'][number]) => {
  uiState.selected = brand;
  console.log(brand);
};

const save = async () => {
  const { data } = await makeCaribbeanClient().POST('/brand', {
    body: {
      brandName: '백오피스테스트',
      upperEstCd: 'S186415',
      largeGbn: 'S186415',
      openDateTime: dayjs().toISOString(),
      phoneCollectionDateTimeStart: dayjs().toISOString(),
      phoneCollectionDateTimeEnd: dayjs().toISOString(),
      serviceYn: 'N',
      brandPath: '',
    },
  });
  console.log(data);
};
</script>
<template>
  <div class="rootDiv">
    <VDialog v-model="uiState.dialog" width="auto" :persistent="true">
      <v-card class="d-flex" style="justify-content: center; align-items: center">
        <v-card-text>브랜드 등록중입니다</v-card-text>
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-card>
    </VDialog>

    <VDialog v-model="uiState.searchDialog">
      <brand-search-dialog
        v-model="uiState.searchDialog"
        permanent="true"
        @update:model-value="
          (dialog: any) => {
            uiState.searchDialog = dialog;
          }
        "
        @select="handleBrandSelect"
      ></brand-search-dialog>
    </VDialog>
    <VCard class="rootCard">
      <h2>{{ meta_coupon_number === 'new' ? '브랜드 전환등록' : '브랜드 수정' }}</h2>
      <v-form
        ref="formRef"
        @submit.prevent="
          () => {
            save();
          }
        "
      >
        <div class="d-flex form-row">
          <VLabel class="title-element">본사고객코드-대분류</VLabel>
          <VTextField
            class="flex-grow-1 right-element"
            label="브랜드 대분류 코드(freshon est_info.large_gbn)"
            :rules="[(value: string) => !!value?.trim() || '브랜드대분류코드 를 입력하세요']"
          ></VTextField>
          <VBtn
            style="margin-left: 8px"
            @click="
              () => {
                uiState.searchDialog = true;
              }
            "
          >
            검색
          </VBtn>
        </div>
        <div class="d-flex form-row">
          <VLabel class="title-element">본점고객코드(본사고객코드-중분류)</VLabel>
          <VTextField
            class="flex-grow-1 right-element"
            label="본점고객코드"
            :rules="[(value: string) => !!value?.trim() || '본점고객코드 를 입력하세요']"
          ></VTextField>
          <VBtn style="margin-left: 8px">검색</VBtn>
        </div>
        <div class="d-flex form-row">
          <VLabel class="title-element">서비스대상여부</VLabel>
          <VTextField class="right-element" type="text" label="N" :maxlength="12" :rules="[]"></VTextField>
        </div>
        <div class="d-flex form-row">
          <VLabel class="title-element">오픈일시</VLabel>
          <vue-date-picker
            class="right-element"
            :enable-time-picker="false"
            v-model="uiState.openDate"
            :start-time="{ hours: 0, minutes: 0, seconds: 0 }"
            name="started"
            :format="'yyyy-MM-dd 00:00:00'"
            text-input
            auto-apply
            show-now-button
            locale="ko-KR"
            week-start="0"
            :clearable="false"
            :enable-seconds="true"
            @keydown.prevent
          ></vue-date-picker>
          <div></div>
        </div>
        <div class="d-flex form-row">
          <VLabel class="title-element">전화번호수집기간</VLabel>
          <vue-date-picker
            class="right-element"
            :enable-time-picker="false"
            v-model="uiState.collectionDateStart"
            :start-time="{ hours: 0, minutes: 0, seconds: 0 }"
            name="started"
            :format="'yyyy-MM-dd 00:00:00'"
            text-input
            auto-apply
            show-now-button
            locale="ko-KR"
            week-start="0"
            :clearable="false"
            :enable-seconds="true"
            @keydown.prevent
          ></vue-date-picker>
          ~
          <vue-date-picker
            :enable-time-picker="false"
            :start-time="{ hours: 23, minutes: 59, seconds: 59 }"
            v-model="uiState.collectionDateEnd"
            name="ended"
            :format="'yyyy-MM-dd 23:59:59'"
            text-input
            auto-apply
            show-now-button
            locale="ko-KR"
            week-start="0"
            :clearable="false"
            :enable-seconds="true"
            @keydown.prevent
          ></vue-date-picker>
        </div>
        <br />
        <VDivider></VDivider>
        <br />
        <VBtn type="submit">저장</VBtn>
        <VBtn
          class="right-element"
          @click="
            () => {
              `쿠폰${meta_coupon_number === 'new' ? '등록' : '수정'}`;
            }
          "
        >
          취소
        </VBtn>
        <VTextField>{{ uiState.selected ? JSON.stringify(uiState.selected) : '' }}</VTextField>
      </v-form>
    </VCard>
  </div>
</template>

<style scoped>
.rootDiv {
  position: relative;
}

.rootCard {
  position: relative;
  padding: 16px;
  min-height: 800px;
}

.form-row {
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 2px;
  padding-bottom: 2px;
  border-style: solid;
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.05);
  margin-top: 8px;
  align-items: center;
}

.title-element {
  min-width: 320px;
}

.right-element {
  margin-left: 8px;
}
</style>
