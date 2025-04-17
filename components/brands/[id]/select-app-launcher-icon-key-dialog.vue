<script setup lang="ts">
const props = defineProps({
  dialog: {
    type: Boolean,
    required: true,
  },
  appLauncherIconKey: {
    type: String,
    default: undefined,
  },
  customClass: {
    type: [String, Array, Object],
    default: '',
  },
});

const emit = defineEmits(['update:dialog', 'update:appLauncherIconKey', 'file-removed']);

const APP_ICON_PAGE_SIZE = 8;

const appIconInfo = ref<CaribbeanApiResponseBody['/app/icon']['get']['items']>([]);

const localDialog = ref(props.dialog);
const localAppLauncherIconKey = ref(props.appLauncherIconKey);

const defaultQuery: CaribbeanApiQueryParams['/app/icon']['get'] = {
  keyword: undefined,
  page: 1,
  pageSize: APP_ICON_PAGE_SIZE,
};
const query = reactive({
  ...defaultQuery,
});
const appIconTotalPages = ref(1);

const selectAppIconItem = (item: CaribbeanApiResponseBody['/app/icon']['get']['items'][0]) => {
  localAppLauncherIconKey.value = item.headquarterAppLauncherIconKey;
  localDialog.value = false;
};

const fetchAppIconInfo = async () => {
  const { data } = await makeCaribbeanClient().GET('/app/icon', {
    params: {
      query,
    },
  });

  appIconInfo.value = data?.items || [];
  appIconTotalPages.value = data?.pagination.totalPage || 1;
};

fetchAppIconInfo();

watch(
  () => [query.page, query.pageSize],
  () => {
    fetchAppIconInfo();
  },
);

watch(
  () => props.dialog,
  (newDialog) => {
    localDialog.value = newDialog;
  },
);
watch(localDialog, (newDialog) => {
  emit('update:dialog', newDialog);
});
watch(
  () => props.appLauncherIconKey,
  (newAppLauncherIconKey) => {
    localAppLauncherIconKey.value = newAppLauncherIconKey;
  },
);
watch(localAppLauncherIconKey, (newAppLauncherIconKey) => {
  emit('update:appLauncherIconKey', newAppLauncherIconKey);
});
</script>

<template>
  <VCol :class="['d-flex align-center justify-center dp__relative', customClass]">
    <div v-if="localAppLauncherIconKey" class="d-flex align-center">
      <div class="cursor-pointer" @click="localDialog = true" style="max-width: 200px">
        {{ localAppLauncherIconKey }}
      </div>
      <IconBtn class="close-icon" style="width: 24px; height: 24px" @click="emit('file-removed')">
        <VIcon icon="ri-close-line" />
      </IconBtn>
    </div>
    <VBtn v-else variant="outlined" class="ml-5" @click="localDialog = true">선택</VBtn>

    <VDialog v-model="localDialog" width="600">
      <VCard title="앱 런쳐 아이콘 식별정보 선택">
        <VTable>
          <thead>
            <tr>
              <th class="text-center">ID</th>
              <th class="text-center">아이콘 썸네일</th>
              <th class="text-center">앱 런쳐 아이콘 키</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hovered-row" v-for="item in appIconInfo" :key="item.id" @click="selectAppIconItem(item)">
              <td class="text-center">{{ item.id }}</td>
              <td class="text-center" style="height: 60px">
                <VImg :src="item.thumbnailUri" :style="{ maxHeight: '60px' }" />
              </td>
              <td class="text-center">{{ item.headquarterAppLauncherIconKey }}</td>
            </tr>
          </tbody>
        </VTable>
        <div style="padding-top: 16px; padding-bottom: 16px">
          <VPagination v-model="query.page" :length="appIconTotalPages" :total-visible="`${APP_ICON_PAGE_SIZE}`" />
        </div>
      </VCard>
    </VDialog>
  </VCol>
</template>

<style scoped>
.close-icon {
  position: absolute;
  right: 0;
  background-color: rgba(0, 0, 0, 0.2);
}

.hovered-row:hover {
  cursor: pointer;
  background-color: #f5f5f5;
}
</style>
