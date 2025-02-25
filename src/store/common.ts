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
    avatarPath: string;
}

const defaultState: CommonState = {
    language: LanguageEnum.ZH_CN,
    darkMode: DARK_MODE.LIGHT,
    themeColor: ThemeEnum.GREEN,
    sessionMode: SessionModeEnum.LEFT,
    followSystem: false,
    avatarPath: '',
};

export const useCommonStore = defineStore('common', () => {
    const language = ref<LanguageEnum>(defaultState.language);
    const darkMode = ref<DARK_MODE>(defaultState.darkMode);
    const themeColor = ref<ThemeEnum>(defaultState.themeColor);
    const sessionMode = ref<SessionModeEnum>(defaultState.sessionMode);
    const followSystem = ref<boolean>(defaultState.followSystem);
    const avatarPath = ref<string>(defaultState.avatarPath);

    const getLanguage = computed(() => language.value);
    const getDarkMode = computed(() => darkMode.value);
    const getThemeColor = computed(() => themeColor.value);
    const getSessionMode = computed(() => sessionMode.value);
    const getFollowSystem = computed(() => followSystem.value);
    const getAvatarPath = computed(() => avatarPath.value);

    // 同步数据到本地存储
    const syncData = async () => {
        await store.set('common', {
            language: language.value,
            darkMode: darkMode.value,
            themeColor: themeColor.value,
            sessionMode: sessionMode.value,
            followSystem: followSystem.value,
            avatarPath: avatarPath.value,
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
            avatarPath.value = savedState.avatarPath;
        } else {
            language.value = defaultState.language;
            darkMode.value = defaultState.darkMode;
            themeColor.value = defaultState.themeColor;
            sessionMode.value = defaultState.sessionMode;
            followSystem.value = defaultState.followSystem;

            // 初始化头像存储路径
            try {
                const { appDataDir } = await import('@tauri-apps/api/path');
                const appDirPath = await appDataDir();
                avatarPath.value = `${appDirPath}/avatars`;

                // 确保目录存在
                const { mkdir, exists } = await import('@tauri-apps/plugin-fs');
                if (!(await exists(avatarPath.value))) {
                    await mkdir(avatarPath.value, { recursive: true });
                }
            } catch (error) {
                console.error('初始化头像路径失败:', error);
                avatarPath.value = '';
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

    const setAvatarPath = async (val: string) => {
        avatarPath.value = val;
        await syncData();
    };

    return {
        getLanguage,
        getDarkMode,
        getThemeColor,
        getSessionMode,
        getFollowSystem,
        getAvatarPath,
        setLanguage,
        setDarkMode,
        setThemeColor,
        setSessionMode,
        setFollowSystem,
        setAvatarPath,
        initializeStore,
    };
});
