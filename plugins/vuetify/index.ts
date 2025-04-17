import { createVuetify } from 'vuetify';
import { VBtn } from 'vuetify/components/VBtn';
import defaults from './defaults';
import { icons } from './icons';
import { themes } from './theme';
import { VSnackbarQueue } from 'vuetify/labs/components';

import '@core/scss/template/libs/vuetify/index.scss';
import 'vuetify/styles';

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    aliases: {
      IconBtn: VBtn,
    },
    defaults,
    icons,
    theme: {
      defaultTheme: 'light',
      themes,
    },
    components: {
      VSnackbarQueue,
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
