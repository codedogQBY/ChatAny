import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { LanguageEnum, DARK_MODE, ThemeEnum, SessionModeEnum } from '@/types';
import store from '@/hook/useStore';

interface CommonState {
    language: LanguageEnum;
    darkMode: DARK_MODE;
    themeColor: ThemeEnum;
    sessionMode: SessionModeEnum;
    followSystem: boolean;
    imagePath: string;
    // 会话命名模型Id
    sessionModelId: string;
    // 快捷指令模型Id
    shortcutModelId: string;
    // 翻译模型Id
    translateModelId: string;
}

const defaultState: CommonState = {
    language: LanguageEnum.ZH_CN,
    darkMode: DARK_MODE.LIGHT,
    themeColor: ThemeEnum.GREEN,
    sessionMode: SessionModeEnum.LEFT,
    followSystem: false,
    imagePath: '',
    sessionModelId: '',
    shortcutModelId: '',
    translateModelId: '',
};

export const useCommonStore = defineStore('common', () => {
    const language = ref<LanguageEnum>(defaultState.language);
    const darkMode = ref<DARK_MODE>(defaultState.darkMode);
    const themeColor = ref<ThemeEnum>(defaultState.themeColor);
    const sessionMode = ref<SessionModeEnum>(defaultState.sessionMode);
    const followSystem = ref<boolean>(defaultState.followSystem);
    const imagePath = ref<string>(defaultState.imagePath);
    const sessionModelId = ref<string>(defaultState.sessionModelId);
    const shortcutModelId = ref<string>(defaultState.shortcutModelId);
    const translateModelId = ref<string>(defaultState.translateModelId);

    const getLanguage = computed(() => language.value);
    const getDarkMode = computed(() => darkMode.value);
    const getThemeColor = computed(() => themeColor.value);
    const getSessionMode = computed(() => sessionMode.value);
    const getFollowSystem = computed(() => followSystem.value);
    const getImagePath = computed(() => imagePath.value);
    const getSessionModelId = computed(() => sessionModelId.value);
    const getShortcutModelId = computed(() => shortcutModelId.value);
    const getTranslateModelId = computed(() => translateModelId.value);

    // 同步数据到本地存储
    const syncData = async () => {
        await store.set('common', {
            language: language.value,
            darkMode: darkMode.value,
            themeColor: themeColor.value,
            sessionMode: sessionMode.value,
            followSystem: followSystem.value,
            imagePath: imagePath.value,
            sessionModelId: sessionModelId.value,
            shortcutModelId: shortcutModelId.value,
            translateModelId: translateModelId.value,
        });
    };

    // 初始化数据
    const initializeStore = async () => {
        const savedState = await store.get<CommonState>('common');
        if (savedState) {
            language.value = savedState.language;
            darkMode.value = savedState.darkMode;
            themeColor.value = savedState.themeColor;
            sessionMode.value = savedState.sessionMode;
            followSystem.value = savedState.followSystem;
            imagePath.value = savedState.imagePath;
            sessionModelId.value = savedState.sessionModelId;
            shortcutModelId.value = savedState.shortcutModelId;
            translateModelId.value = savedState.translateModelId;
        } else {
            language.value = defaultState.language;
            darkMode.value = defaultState.darkMode;
            themeColor.value = defaultState.themeColor;
            sessionMode.value = defaultState.sessionMode;
            followSystem.value = defaultState.followSystem;
            sessionModelId.value = defaultState.sessionModelId;
            shortcutModelId.value = defaultState.shortcutModelId;
            translateModelId.value = defaultState.translateModelId;

            // 初始化图片存储路径
            try {
                const { appDataDir } = await import('@tauri-apps/api/path');
                const appDirPath = await appDataDir();
                imagePath.value = `${appDirPath}/images`;

                // 确保目录存在
                const { mkdir, exists } = await import('@tauri-apps/plugin-fs');
                if (!(await exists(imagePath.value))) {
                    await mkdir(imagePath.value, { recursive: true });
                }
            } catch (error) {
                console.error('初始化图片路径失败:', error);
                imagePath.value = '';
            }

            await syncData();
        }

        // 初始化主题和暗黑模式
        setDarkMode(darkMode.value);
        setThemeColor(themeColor.value);
    };

    const setLanguage = async (val: LanguageEnum) => {
        language.value = val;
        await syncData();
    };

    const setDarkMode = async (val: DARK_MODE) => {
        darkMode.value = val;
        // 设置暗黑模式，html 根元素添加 class dark
        document.documentElement.classList.toggle('dark', val === DARK_MODE.DARK);
        await syncData();
    };

    const setThemeColor = async (val: ThemeEnum) => {
        themeColor.value = val;
        document.documentElement.classList.remove(
            'theme-green',
            'theme-rose',
            'theme-blue',
            'theme-zinc',
            'theme-orange',
            'theme-yellow',
            'theme-violet',
            'theme-red'
        );
        document.documentElement.classList.add(`theme-${val}`);
        await syncData();
    };

    const setSessionMode = async (val: SessionModeEnum) => {
        sessionMode.value = val;
        await syncData();
    };

    const setFollowSystem = async (val: boolean) => {
        followSystem.value = val;
        await syncData();
    };

    const setImagePath = async (val: string) => {
        imagePath.value = val;
        await syncData();
    };

    const setSessionModelId = async (val: string) => {
        sessionModelId.value = val;
        await syncData();
    };

    const setShortcutModelId = async (val: string) => {
        shortcutModelId.value = val;
        await syncData();
    };

    const setTranslateModelId = async (val: string) => {
        translateModelId.value = val;
        await syncData();
    };

    return {
        getLanguage,
        getDarkMode,
        getThemeColor,
        getSessionMode,
        getFollowSystem,
        getImagePath,
        getSessionModelId,
        getShortcutModelId,
        getTranslateModelId,
        setLanguage,
        setDarkMode,
        setThemeColor,
        setSessionMode,
        setFollowSystem,
        setImagePath,
        initializeStore,
        setSessionModelId,
        setShortcutModelId,
        setTranslateModelId,
    };
});
