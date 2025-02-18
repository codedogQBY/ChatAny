import { ref, watch } from 'vue';
import { DARK_MODE } from '@/types/index.d.ts';
import { useCommonStore } from '@/store/common';

export default function useLightDarkSwitch() {
    const commonStore = useCommonStore();
    const darkMode = ref(commonStore.getDarkMode);

    // 监听 commonStore 的变化，并更新 darkMode
    watch(
        () => commonStore.getDarkMode,
        (newMode) => {
            darkMode.value = newMode;
        }
    );

    const toggleDarkMode = () => {
        const newMode = darkMode.value === DARK_MODE.LIGHT ? DARK_MODE.DARK : DARK_MODE.LIGHT;
        darkMode.value = newMode;
        commonStore.setDarkMode(newMode);
    };

    const setDarkMode = (val: DARK_MODE) => {
        darkMode.value = val;
        commonStore.setDarkMode(val);
    };

    return {
        darkMode,
        toggleDarkMode,
        setDarkMode,
    };
}
